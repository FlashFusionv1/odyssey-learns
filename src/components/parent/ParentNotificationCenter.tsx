/**
 * ParentNotificationCenter Component
 * 
 * Dropdown notification center for parents showing real-time alerts
 * about peer requests, achievements, and system notifications.
 */

import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useParentNotifications, ParentNotification } from '@/hooks/useParentNotifications';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Users,
  Trophy,
  Gift,
  BarChart3,
  AlertCircle,
  Check,
  CheckCheck,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const getNotificationIcon = (type: string) => {
  const icons: Record<string, typeof Users> = {
    peer_request: Users,
    activity_join: Users,
    reward_redemption: Gift,
    achievement: Trophy,
    weekly_summary: BarChart3,
    system: AlertCircle,
  };
  return icons[type] || AlertCircle;
};

const getNotificationColor = (type: string) => {
  const colors: Record<string, string> = {
    peer_request: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    activity_join: 'text-green-500 bg-green-100 dark:bg-green-900/30',
    reward_redemption: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
    achievement: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
    weekly_summary: 'text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30',
    system: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  };
  return colors[type] || 'text-gray-500 bg-gray-100';
};

export const ParentNotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useParentNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: ParentNotification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      navigate(notification.action_url);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 h-5 min-w-[20px] px-1 text-xs"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllAsRead}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1 p-1">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.notification_type);
                const colorClass = getNotificationColor(notification.notification_type);

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-md p-3 text-left transition-colors',
                      notification.is_read
                        ? 'hover:bg-muted/50'
                        : 'bg-muted/30 hover:bg-muted'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                        colorClass
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            'text-sm',
                            !notification.is_read && 'font-medium'
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-sm"
            onClick={() => {
              navigate('/parent-dashboard');
              setOpen(false);
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
