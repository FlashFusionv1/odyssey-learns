-- Add parent approval fields to peer_connections
ALTER TABLE public.peer_connections
ADD COLUMN IF NOT EXISTS parent_approved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_approved_at timestamptz,
ADD COLUMN IF NOT EXISTS parent_approved_by uuid,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Create index for faster parent approval queries
CREATE INDEX IF NOT EXISTS idx_peer_connections_parent_approval 
ON public.peer_connections(child_id, parent_approved, status);

-- Add missing columns to parent_notifications if they don't exist
ALTER TABLE public.parent_notifications
ADD COLUMN IF NOT EXISTS action_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_actionable boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS action_taken_at timestamptz,
ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Update function to use metadata instead of action_data
CREATE OR REPLACE FUNCTION notify_parent_peer_request()
RETURNS TRIGGER AS $$
DECLARE
  child_name text;
  peer_name text;
  parent_id uuid;
BEGIN
  -- Get the child's name and parent
  SELECT c.name, c.parent_id INTO child_name, parent_id
  FROM public.children c WHERE c.id = NEW.child_id;
  
  -- Get the peer's name
  SELECT c.name INTO peer_name
  FROM public.children c WHERE c.id = NEW.peer_id;
  
  -- Create notification for parent
  INSERT INTO public.parent_notifications (
    parent_id,
    child_id,
    notification_type,
    title,
    message,
    action_url,
    metadata,
    is_actionable
  ) VALUES (
    parent_id,
    NEW.child_id,
    'peer_request',
    'New Friend Request',
    peer_name || ' wants to connect with ' || child_name,
    '/parent-dashboard',
    jsonb_build_object('peer_connection_id', NEW.id, 'peer_id', NEW.peer_id),
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new peer connection requests
DROP TRIGGER IF EXISTS on_peer_connection_request ON public.peer_connections;
CREATE TRIGGER on_peer_connection_request
AFTER INSERT ON public.peer_connections
FOR EACH ROW
EXECUTE FUNCTION notify_parent_peer_request();