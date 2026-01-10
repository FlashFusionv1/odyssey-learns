-- Fix overly permissive RLS policies on parent_notifications
-- Replace "System can insert notifications" policy with a proper check

DROP POLICY IF EXISTS "System can insert notifications" ON public.parent_notifications;

-- Allow inserts from authenticated users only, and via triggers (SECURITY DEFINER)
-- The trigger function runs with SECURITY DEFINER which bypasses RLS
CREATE POLICY "Authenticated users can create notifications for themselves"
ON public.parent_notifications FOR INSERT
WITH CHECK (auth.uid() = parent_id);

-- Also need to add a policy that allows the trigger to insert
-- Since our trigger function is SECURITY DEFINER, we need to allow service_role inserts
-- This is done by the function running as definer, no additional policy needed