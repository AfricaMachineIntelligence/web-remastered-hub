-- Create role enum
CREATE TYPE public.app_role AS ENUM (
  'guest', 'group_host', 'corp_admin', 'frontdesk', 'provider',
  'restaurant', 'manager', 'owner', 'admin'
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'guest');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_demo_role(_role public.app_role)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.user_roles WHERE user_id = auth.uid();
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), _role);
END; $$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Services / resources / staff / bookings
CREATE TYPE public.service_category AS ENUM ('spa', 'kids_salon', 'barber', 'restaurant');

CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category public.service_category NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  specialty TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','checked_in','in_progress','completed','cancelled','no_show');

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE SET NULL,
  price_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points_balance INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.loyalty_accounts(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  description TEXT NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "Anyone can view active resources" ON public.resources FOR SELECT USING (is_active = true);
CREATE POLICY "Managers can manage resources" ON public.resources FOR ALL USING (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Anyone can view active staff" ON public.staff FOR SELECT USING (is_active = true);
CREATE POLICY "Managers can manage staff" ON public.staff FOR ALL USING (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Guests can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = guest_id);
CREATE POLICY "Guests can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = guest_id);
CREATE POLICY "Staff can view all bookings" ON public.bookings FOR SELECT USING (public.has_role(auth.uid(),'frontdesk') OR public.has_role(auth.uid(),'provider') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Staff can update bookings" ON public.bookings FOR UPDATE USING (public.has_role(auth.uid(),'frontdesk') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users can view items for their bookings" ON public.booking_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = booking_items.booking_id AND bookings.guest_id = auth.uid()));
CREATE POLICY "Users can create booking items" ON public.booking_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = booking_items.booking_id AND bookings.guest_id = auth.uid()));
CREATE POLICY "Staff can view all booking items" ON public.booking_items FOR SELECT USING (public.has_role(auth.uid(),'frontdesk') OR public.has_role(auth.uid(),'provider') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users can view their own loyalty account" ON public.loyalty_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own loyalty account" ON public.loyalty_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System creates loyalty accounts" ON public.loyalty_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff can view all loyalty accounts" ON public.loyalty_accounts FOR SELECT USING (public.has_role(auth.uid(),'frontdesk') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users can view their own transactions" ON public.loyalty_transactions FOR SELECT USING (EXISTS (SELECT 1 FROM public.loyalty_accounts WHERE loyalty_accounts.id = loyalty_transactions.account_id AND loyalty_accounts.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.generate_booking_number()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_number TEXT;
BEGIN
  new_number := 'BK' || TO_CHAR(NOW(),'YYYYMMDD') || LPAD(FLOOR(RANDOM()*10000)::TEXT,4,'0');
  RETURN new_number;
END; $$;

CREATE OR REPLACE FUNCTION public.ensure_loyalty_account()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.loyalty_accounts (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER create_loyalty_account AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.ensure_loyalty_account();
CREATE TRIGGER set_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_loyalty_accounts_updated_at BEFORE UPDATE ON public.loyalty_accounts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed services (original 4 categories)
INSERT INTO public.services (name, category, description, duration_minutes, price_cents) VALUES
('Swedish Massage','spa','Relaxing full-body massage with gentle pressure',60,85000),
('Deep Tissue Massage','spa','Intense massage targeting deep muscle layers',60,95000),
('Hot Stone Therapy','spa','Heated stones for deep relaxation',90,120000),
('Aromatherapy Massage','spa','Therapeutic massage with essential oils',60,90000),
('Facial Treatment','spa','Deep cleansing and rejuvenation facial',60,75000),
('Body Wrap','spa','Detoxifying body treatment',90,110000),
('Manicure & Pedicure','spa','Complete nail care and polish',60,65000),
('Kids Haircut (Under 12)','kids_salon','Fun haircut experience for children',30,25000),
('Teen Style Cut','kids_salon','Modern cuts for teens',45,35000),
('Kids Braiding & Styling','kids_salon','Creative braids and updos',45,40000),
('Kids Nail Art','kids_salon','Fun nail painting for children',30,20000),
('Birthday Party Package','kids_salon','Group styling for celebrations',120,150000),
('Mens Haircut','barber','Classic or modern mens cuts',30,30000),
('Beard Trim & Shape','barber','Precise beard grooming',20,20000),
('Hot Towel Shave','barber','Traditional straight razor shave',45,45000),
('Hair Color (Mens)','barber','Professional mens hair coloring',60,55000),
('Haircut & Beard Combo','barber','Complete grooming package',45,45000),
('Lunch Seating','restaurant','Table reservation for lunch service',90,0),
('Dinner Seating','restaurant','Table reservation for dinner service',120,0),
('Private Dining (4-8 guests)','restaurant','Exclusive dining area',180,50000),
('Event Space (Up to 20)','restaurant','Private event booking',240,100000);

INSERT INTO public.resources (name, type, capacity) VALUES
('Treatment Room 1','room',1),('Treatment Room 2','room',1),('Treatment Room 3','room',1),('Treatment Room 4','room',1),
('Kids Chair 1','chair',1),('Kids Chair 2','chair',1),('Kids Chair 3','chair',1),
('Barber Chair 1','chair',1),('Barber Chair 2','chair',1),
('Table 1','table',4),('Table 2','table',4),('Table 3','table',4),('Table 4','table',2),('Table 5','table',2),
('Private Dining Room','room',8);

INSERT INTO public.staff (name, specialty) VALUES
('Sarah Johnson','Swedish & Deep Tissue Massage'),
('Michael Chen','Aromatherapy & Hot Stone'),
('Emma Davis','Facial Treatments & Body Wraps'),
('Lisa Anderson','Full Body Therapist'),
('Tom Wilson','Senior Barber'),
('Jake Martinez','Master Barber & Colorist'),
('Sophie Taylor','Kids Stylist'),
('Mia Brown','Kids Specialist & Party Host');

-- Products & orders
CREATE TYPE public.product_category AS ENUM ('skincare','haircare','wellness','tools','gift_sets');

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category public.product_category NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.order_status AS ENUM ('pending','confirmed','processing','shipped','delivered','cancelled');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT,
  subtotal_cents INTEGER NOT NULL,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Managers can manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Customers can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Staff can view all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(),'frontdesk') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Staff can update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users can view items for their orders" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()));
CREATE POLICY "Users can create order items" ON public.order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()));
CREATE POLICY "Staff can view all order items" ON public.order_items FOR SELECT USING (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_number TEXT;
BEGIN
  new_number := 'ORD' || TO_CHAR(NOW(),'YYYYMMDD') || LPAD(FLOOR(RANDOM()*10000)::TEXT,4,'0');
  RETURN new_number;
END; $$;

CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

INSERT INTO public.products (name, category, description, price_cents, stock_quantity, image_url) VALUES
('Lavender Face Serum','skincare','Hydrating serum with organic lavender extract. Perfect for all skin types.',45000,50,'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop'),
('Rose Clay Face Mask','skincare','Detoxifying mask with pink clay and rose petals. Weekly treatment.',35000,40,'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop'),
('Vitamin C Brightening Cream','skincare','Anti-aging moisturizer with vitamin C and hyaluronic acid.',55000,35,'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'),
('Gentle Exfoliating Scrub','skincare','Natural bamboo and green tea face scrub. Use 2-3x weekly.',30000,60,'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400&h=400&fit=crop'),
('Argan Oil Hair Treatment','haircare','Deep conditioning treatment with pure Moroccan argan oil.',40000,45,'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop'),
('Strengthening Shampoo','haircare','Protein-rich shampoo for damaged and color-treated hair.',28000,70,'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&h=400&fit=crop'),
('Leave-In Conditioner Spray','haircare','Lightweight conditioning spray with keratin and silk proteins.',32000,55,'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop'),
('Scalp Massage Oil','haircare','Stimulating oil blend with rosemary and peppermint. Promotes growth.',35000,40,'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=400&fit=crop'),
('Aromatherapy Diffuser Set','wellness','Ceramic diffuser with 5 essential oil blends. Creates spa atmosphere.',65000,25,'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop'),
('Luxury Bath Salts','wellness','Dead Sea salts infused with lavender and chamomile. 500g jar.',38000,50,'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop'),
('Meditation Cushion','wellness','Ergonomic buckwheat-filled cushion for yoga and meditation.',55000,20,'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop'),
('Herbal Sleep Tea','wellness','Organic blend of chamomile, valerian, and passionflower. 20 sachets.',25000,80,'https://images.unsplash.com/photo-1597318112726-f8d24c37dc6e?w=400&h=400&fit=crop'),
('Jade Face Roller','tools','Natural jade stone roller for facial massage and lymphatic drainage.',42000,30,'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop'),
('Professional Hair Dryer','tools','Ionic technology dryer with 3 heat settings and cool shot button.',75000,15,'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop'),
('Manicure Tool Kit','tools','Complete 10-piece stainless steel nail care set in leather case.',48000,35,'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop'),
('Massage Stone Set','tools','Heated basalt stones for hot stone massage therapy. Set of 12.',85000,18,'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&h=400&fit=crop'),
('Spa Day Gift Box','gift_sets','Curated box with face mask, bath salts, candle, and body lotion.',95000,25,'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop'),
('Mens Grooming Kit','gift_sets','Premium beard oil, aftershave balm, and styling pomade gift set.',80000,20,'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=400&h=400&fit=crop'),
('Kids Spa Party Pack','gift_sets','Fun nail polish set, glitter hair gel, and accessories for 4 kids.',65000,30,'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop'),
('Ultimate Self-Care Bundle','gift_sets','Our bestsellers: serum, mask, bath salts, diffuser, and jade roller.',180000,15,'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=400&fit=crop');

-- Vouchers
CREATE TYPE public.voucher_type AS ENUM ('gift_certificate','discount','service_credit');
CREATE TYPE public.voucher_status AS ENUM ('active','redeemed','expired','cancelled');

CREATE TABLE public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  voucher_type public.voucher_type NOT NULL,
  value_cents INTEGER NOT NULL,
  balance_cents INTEGER NOT NULL,
  status public.voucher_status NOT NULL DEFAULT 'active',
  purchaser_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_email TEXT,
  recipient_name TEXT,
  message TEXT,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ NOT NULL,
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.voucher_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  redeemed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.voucher_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their purchased vouchers" ON public.vouchers FOR SELECT USING (auth.uid() = purchaser_id);
CREATE POLICY "Users can view vouchers sent to them" ON public.vouchers FOR SELECT USING (auth.uid()::text IN (SELECT id::text FROM public.profiles WHERE email = vouchers.recipient_email));
CREATE POLICY "Users can view vouchers they redeemed" ON public.vouchers FOR SELECT USING (auth.uid() = redeemed_by);
CREATE POLICY "Users can create vouchers" ON public.vouchers FOR INSERT WITH CHECK (auth.uid() = purchaser_id);
CREATE POLICY "Staff can view all vouchers" ON public.vouchers FOR SELECT USING (public.has_role(auth.uid(),'frontdesk') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Staff can update vouchers" ON public.vouchers FOR UPDATE USING (public.has_role(auth.uid(),'frontdesk') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users can view their redemptions" ON public.voucher_redemptions FOR SELECT USING (auth.uid() = redeemed_by OR EXISTS (SELECT 1 FROM public.vouchers WHERE vouchers.id = voucher_redemptions.voucher_id AND vouchers.purchaser_id = auth.uid()));
CREATE POLICY "Users can create redemptions" ON public.voucher_redemptions FOR INSERT WITH CHECK (auth.uid() = redeemed_by);
CREATE POLICY "Staff can view all redemptions" ON public.voucher_redemptions FOR SELECT USING (public.has_role(auth.uid(),'frontdesk') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.generate_voucher_code()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_code TEXT; code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'PALM-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)) || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    SELECT EXISTS (SELECT 1 FROM public.vouchers WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END; $$;

CREATE OR REPLACE FUNCTION public.redeem_voucher(_voucher_code TEXT, _amount_cents INTEGER, _booking_id UUID DEFAULT NULL, _order_id UUID DEFAULT NULL)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _voucher RECORD;
BEGIN
  SELECT * INTO _voucher FROM public.vouchers WHERE code = _voucher_code AND status = 'active' AND valid_from <= NOW() AND valid_until >= NOW() FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid, expired, or already redeemed voucher code');
  END IF;
  IF _voucher.balance_cents < _amount_cents THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient voucher balance');
  END IF;
  INSERT INTO public.voucher_redemptions (voucher_id, booking_id, order_id, amount_cents, redeemed_by)
  VALUES (_voucher.id, _booking_id, _order_id, _amount_cents, auth.uid());
  UPDATE public.vouchers SET
    balance_cents = balance_cents - _amount_cents,
    status = CASE WHEN (balance_cents - _amount_cents) = 0 THEN 'redeemed'::public.voucher_status ELSE status END,
    redeemed_at = CASE WHEN (balance_cents - _amount_cents) = 0 THEN NOW() ELSE redeemed_at END,
    redeemed_by = CASE WHEN (balance_cents - _amount_cents) = 0 THEN auth.uid() ELSE redeemed_by END,
    updated_at = NOW()
  WHERE id = _voucher.id;
  RETURN json_build_object('success', true, 'remaining_balance', _voucher.balance_cents - _amount_cents, 'redeemed_amount', _amount_cents);
END; $$;

CREATE TRIGGER set_vouchers_updated_at BEFORE UPDATE ON public.vouchers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.bookings ADD COLUMN voucher_discount_cents INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN voucher_discount_cents INTEGER DEFAULT 0;

-- CRM
CREATE TYPE contact_status AS ENUM ('active','inactive','vip','blacklisted');
CREATE TYPE lead_status AS ENUM ('new','contacted','qualified','proposal','negotiation','won','lost');
CREATE TYPE lead_source AS ENUM ('website','referral','social_media','walk_in','phone','email','event','other');
CREATE TYPE activity_type AS ENUM ('call','email','meeting','note','task','follow_up');

CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL, email TEXT, phone TEXT, company TEXT, position TEXT,
  birthday DATE, address TEXT, city TEXT, tags TEXT[],
  status contact_status NOT NULL DEFAULT 'active',
  notes TEXT, last_contact_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL, description TEXT, value_cents INTEGER,
  status lead_status NOT NULL DEFAULT 'new',
  source lead_source NOT NULL DEFAULT 'other',
  assigned_to UUID REFERENCES auth.users(id),
  expected_close_date DATE,
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);
CREATE TABLE public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  type activity_type NOT NULL,
  subject TEXT NOT NULL, description TEXT,
  scheduled_at TIMESTAMPTZ, completed_at TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id UUID,
  user_id UUID REFERENCES auth.users(id), metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all contacts" ON public.contacts FOR SELECT USING (has_role(auth.uid(),'frontdesk') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin'));
CREATE POLICY "Staff can create contacts" ON public.contacts FOR INSERT WITH CHECK (has_role(auth.uid(),'frontdesk') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin'));
CREATE POLICY "Staff can update contacts" ON public.contacts FOR UPDATE USING (has_role(auth.uid(),'frontdesk') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin'));
CREATE POLICY "Staff can view all leads" ON public.leads FOR SELECT USING (has_role(auth.uid(),'frontdesk') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin') OR auth.uid() = assigned_to);
CREATE POLICY "Staff can create leads" ON public.leads FOR INSERT WITH CHECK (has_role(auth.uid(),'frontdesk') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin'));
CREATE POLICY "Staff can update leads" ON public.leads FOR UPDATE USING (has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin') OR auth.uid() = assigned_to);
CREATE POLICY "Staff can view activities" ON public.lead_activities FOR SELECT USING (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = lead_activities.lead_id AND (has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin') OR auth.uid() = leads.assigned_to)));
CREATE POLICY "Staff can create activities" ON public.lead_activities FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = lead_activities.lead_id AND (has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin') OR auth.uid() = leads.assigned_to)));
CREATE POLICY "Staff can update their activities" ON public.lead_activities FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can view event log" ON public.event_log FOR SELECT USING (has_role(auth.uid(),'admin'));
CREATE POLICY "System can insert events" ON public.event_log FOR INSERT WITH CHECK (true);

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_phone ON public.contacts(phone);
CREATE INDEX idx_contacts_status ON public.contacts(status);
CREATE INDEX idx_contacts_birthday ON public.contacts(birthday);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_event_log_entity ON public.event_log(entity_type, entity_id);
CREATE INDEX idx_event_log_user_id ON public.event_log(user_id);

-- Restaurant product categories
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'breakfast';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'lunch';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'dinner';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'beverages';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'desserts';

ALTER TABLE public.orders ADD COLUMN order_type text NOT NULL DEFAULT 'sit-in' CHECK (order_type IN ('sit-in','delivery'));
ALTER TABLE public.orders ADD COLUMN tip_cents integer NOT NULL DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN tip_cents integer NOT NULL DEFAULT 0;

CREATE POLICY "Users can delete items from their bookings" ON public.booking_items FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = booking_items.booking_id AND bookings.guest_id = auth.uid()));
CREATE POLICY "Users can delete items from their orders" ON public.order_items FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()));
CREATE POLICY "Users can update items in their bookings" ON public.booking_items FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = booking_items.booking_id AND bookings.guest_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = booking_items.booking_id AND bookings.guest_id = auth.uid()));

-- Staff scheduling, payouts, invoices
CREATE TABLE public.staff_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
  start_time TIME NOT NULL, end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, weekday, start_time, end_time)
);

CREATE TYPE public.time_off_type AS ENUM ('day_off','private_booking','vacation','sick');
CREATE TABLE public.staff_time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME, end_time TIME,
  all_day BOOLEAN NOT NULL DEFAULT false,
  type public.time_off_type NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE public.revenue_model AS ENUM ('commission','rental');
CREATE TYPE public.booking_source AS ENUM ('platform','private','internal');

ALTER TABLE public.bookings
  ADD COLUMN revenue_model public.revenue_model NOT NULL DEFAULT 'commission',
  ADD COLUMN booking_source public.booking_source NOT NULL DEFAULT 'platform',
  ADD COLUMN order_id UUID;

ALTER TABLE public.staff
  ADD COLUMN commission_rate INTEGER CHECK (commission_rate >= 0 AND commission_rate <= 100),
  ADD COLUMN rental_fee_cents INTEGER DEFAULT 0;

CREATE TABLE public.subcontractor_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  revenue_model public.revenue_model NOT NULL,
  service_price_cents INTEGER NOT NULL,
  amount_to_subcontractor_cents INTEGER NOT NULL,
  amount_to_business_cents INTEGER NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  order_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  subtotal_cents INTEGER NOT NULL,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcontractor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view their own time off" ON public.staff_time_off FOR SELECT USING (EXISTS (SELECT 1 FROM public.staff WHERE staff.id = staff_time_off.staff_id AND staff.user_id = auth.uid()) OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin'));
CREATE POLICY "Staff can manage their own time off" ON public.staff_time_off FOR ALL USING (EXISTS (SELECT 1 FROM public.staff WHERE staff.id = staff_time_off.staff_id AND staff.user_id = auth.uid()) OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin'));
CREATE POLICY "Staff can view their own payouts" ON public.subcontractor_payouts FOR SELECT USING (EXISTS (SELECT 1 FROM public.staff WHERE staff.id = subcontractor_payouts.staff_id AND staff.user_id = auth.uid()) OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin'));
CREATE POLICY "Managers can manage payouts" ON public.subcontractor_payouts FOR ALL USING (has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin'));
CREATE POLICY "Customers can view their own invoices" ON public.invoices FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Staff can view all invoices" ON public.invoices FOR SELECT USING (has_role(auth.uid(),'frontdesk') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin'));
CREATE POLICY "Staff can create invoices" ON public.invoices FOR INSERT WITH CHECK (has_role(auth.uid(),'frontdesk') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin'));
CREATE POLICY "Customers can create their own invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_number TEXT;
BEGIN
  new_number := 'INV' || TO_CHAR(NOW(),'YYYYMMDD') || LPAD(FLOOR(RANDOM()*10000)::TEXT,4,'0');
  RETURN new_number;
END; $$;

CREATE INDEX idx_staff_availability_staff ON public.staff_availability(staff_id);
CREATE INDEX idx_staff_time_off_staff_date ON public.staff_time_off(staff_id, date);
CREATE INDEX idx_bookings_order_id ON public.bookings(order_id);
CREATE INDEX idx_bookings_revenue_model ON public.bookings(revenue_model);
CREATE INDEX idx_bookings_source ON public.bookings(booking_source);
CREATE INDEX idx_subcontractor_payouts_staff ON public.subcontractor_payouts(staff_id);
CREATE INDEX idx_invoices_order_id ON public.invoices(order_id);

CREATE TRIGGER update_staff_availability_updated_at BEFORE UPDATE ON public.staff_availability FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_staff_time_off_updated_at BEFORE UPDATE ON public.staff_time_off FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE POLICY "Insert time off (self/manager/admin/frontdesk/owner)" ON public.staff_time_off FOR INSERT TO authenticated WITH CHECK ((EXISTS (SELECT 1 FROM public.staff WHERE staff.id = staff_time_off.staff_id AND staff.user_id = auth.uid())) OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'frontdesk'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_availability;
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_time_off;

CREATE OR REPLACE FUNCTION public.create_default_staff_availability()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.staff_availability (staff_id, weekday, start_time, end_time) VALUES
    (NEW.id, 1, '09:00', '17:00'),
    (NEW.id, 2, '09:00', '17:00'),
    (NEW.id, 3, '09:00', '17:00'),
    (NEW.id, 4, '09:00', '17:00'),
    (NEW.id, 5, '09:00', '17:00');
  RETURN NEW;
END; $$;

CREATE TRIGGER trigger_create_default_availability AFTER INSERT ON public.staff FOR EACH ROW EXECUTE FUNCTION public.create_default_staff_availability();

DO $$ DECLARE staff_record RECORD;
BEGIN
  FOR staff_record IN SELECT id FROM public.staff s WHERE NOT EXISTS (SELECT 1 FROM public.staff_availability WHERE staff_id = s.id) LOOP
    INSERT INTO public.staff_availability (staff_id, weekday, start_time, end_time) VALUES
      (staff_record.id, 1, '09:00', '17:00'),
      (staff_record.id, 2, '09:00', '17:00'),
      (staff_record.id, 3, '09:00', '17:00'),
      (staff_record.id, 4, '09:00', '17:00'),
      (staff_record.id, 5, '09:00', '17:00');
  END LOOP;
END $$;

-- Family members
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_account_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  relationship TEXT,
  date_of_birth DATE,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their family members" ON public.family_members FOR SELECT USING (auth.uid() = primary_account_id);
CREATE POLICY "Users can create family members" ON public.family_members FOR INSERT WITH CHECK (auth.uid() = primary_account_id);
CREATE POLICY "Users can update their family members" ON public.family_members FOR UPDATE USING (auth.uid() = primary_account_id);
CREATE POLICY "Users can delete their family members" ON public.family_members FOR DELETE USING (auth.uid() = primary_account_id);
CREATE POLICY "Staff can view all family members" ON public.family_members FOR SELECT USING (has_role(auth.uid(),'frontdesk') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin'));

ALTER TABLE public.bookings ADD COLUMN family_member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL;

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON public.family_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE POLICY "Public can view staff availability for booking" ON public.staff_availability FOR SELECT TO public USING (true);
CREATE POLICY "Public can view staff time-off for booking" ON public.staff_time_off FOR SELECT TO public USING (true);

-- New service categories
ALTER TYPE service_category ADD VALUE 'braids';
ALTER TYPE service_category ADD VALUE 'blowout';
ALTER TYPE service_category ADD VALUE 'treatment';
ALTER TYPE service_category ADD VALUE 'needlework';
ALTER TYPE service_category ADD VALUE 'adult_salon';
ALTER TYPE service_category ADD VALUE IF NOT EXISTS 'lash_bar';
ALTER TYPE service_category ADD VALUE IF NOT EXISTS 'kids_spa';
ALTER TYPE service_category ADD VALUE IF NOT EXISTS 'kids_hydro';

-- Note: new enum values must be committed before being used in subsequent statements
-- (this migration runs as one transaction; ADD VALUE then immediate INSERT is invalid in some PG versions).
-- We split by committing via a separate DO block returning quickly.

-- Staff skills + service required skills + add-ons
CREATE TABLE public.staff_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, skill)
);
CREATE TABLE public.service_required_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(service_id, skill)
);
ALTER TABLE public.staff_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_required_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view staff skills" ON public.staff_skills FOR SELECT USING (true);
CREATE POLICY "Managers can manage staff skills" ON public.staff_skills FOR ALL USING (has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin'));
CREATE POLICY "Anyone can view service required skills" ON public.service_required_skills FOR SELECT USING (true);
CREATE POLICY "Managers can manage service required skills" ON public.service_required_skills FOR ALL USING (has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin'));

CREATE TABLE public.service_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  name TEXT NOT NULL, description TEXT, price_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.service_addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active addons" ON public.service_addons FOR SELECT USING (is_active = true);
CREATE POLICY "Managers can manage addons" ON public.service_addons FOR ALL USING (has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin'));

CREATE TABLE public.booking_item_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_item_id UUID NOT NULL REFERENCES public.booking_items(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES public.service_addons(id),
  price_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_item_addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their booking addons" ON public.booking_item_addons FOR SELECT USING (EXISTS (SELECT 1 FROM public.booking_items bi JOIN public.bookings b ON b.id = bi.booking_id WHERE bi.id = booking_item_addons.booking_item_id AND b.guest_id = auth.uid()));
CREATE POLICY "Users can add booking addons" ON public.booking_item_addons FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.booking_items bi JOIN public.bookings b ON b.id = bi.booking_id WHERE bi.id = booking_item_addons.booking_item_id AND b.guest_id = auth.uid()));
CREATE POLICY "Staff can view all booking addons" ON public.booking_item_addons FOR SELECT USING (has_role(auth.uid(),'frontdesk') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Staff can view their own availability" ON public.staff_availability;
DROP POLICY IF EXISTS "Staff can manage their own availability" ON public.staff_availability;
CREATE POLICY "Staff can view availability" ON public.staff_availability FOR SELECT USING (EXISTS (SELECT 1 FROM staff WHERE staff.id = staff_availability.staff_id AND staff.user_id = auth.uid()) OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'frontdesk'));
CREATE POLICY "Staff can insert availability" ON public.staff_availability FOR INSERT WITH CHECK (has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'frontdesk') OR EXISTS (SELECT 1 FROM staff WHERE staff.id = staff_availability.staff_id AND staff.user_id = auth.uid()));
CREATE POLICY "Staff can update availability" ON public.staff_availability FOR UPDATE USING (EXISTS (SELECT 1 FROM staff WHERE staff.id = staff_availability.staff_id AND staff.user_id = auth.uid()) OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'frontdesk'));
CREATE POLICY "Staff can delete availability" ON public.staff_availability FOR DELETE USING (EXISTS (SELECT 1 FROM staff WHERE staff.id = staff_availability.staff_id AND staff.user_id = auth.uid()) OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'frontdesk'));

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS package_discount_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS package_discount_percent integer NOT NULL DEFAULT 0;

-- Data API grants on all public tables
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated;', r.tablename);
    EXECUTE format('GRANT ALL ON public.%I TO service_role;', r.tablename);
    EXECUTE format('GRANT SELECT ON public.%I TO anon;', r.tablename);
  END LOOP;
END $$;