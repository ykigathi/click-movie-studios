import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useUser } from '../contexts/UserContext'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  Reply, 
  Film, 
  Settings,
  Check,
  CheckCheck,
  Trash2,
  Filter
} from 'lucide-react'
import { UserNotification } from '../types'
import { formatDistanceToNow } from 'date-fns'

interface UserNotificationsProps {
  showHeader?: boolean
  maxHeight?: string
}

export const UserNotifications: React.FC<UserNotificationsProps> = ({ 
  showHeader = true,
  maxHeight = "400px"
}) => {
  const { 
    getNotifications, 
    markNotificationAsRead, 
    clearAllNotifications 
  } = useUser()
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const notifications = getNotifications()
  
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: UserNotification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      case 'reply':
        return <Reply className="w-4 h-4 text-green-500" />
      case 'new_movie':
        return <Film className="w-4 h-4 text-purple-500" />
      case 'system':
        return <Settings className="w-4 h-4 text-gray-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getNotificationBadgeVariant = (type: UserNotification['type']) => {
    switch (type) {
      case 'like':
        return 'destructive'
      case 'comment':
        return 'default'
      case 'reply':
        return 'secondary'
      case 'new_movie':
        return 'outline'
      case 'system':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId)
  }

  const handleClearAll = () => {
    clearAllNotifications()
  }

  return (
    <Card className="w-full">
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </Button>
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        <ScrollArea style={{ height: maxHeight }}>
          {filteredNotifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-sm mt-1">
                {filter === 'unread' 
                  ? 'All caught up! Check back later for new updates.'
                  : 'When you receive likes, comments, or replies, they\'ll appear here.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y">
              <AnimatePresence>
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium leading-tight">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                variant={getNotificationBadgeVariant(notification.type)}
                                className="text-xs"
                              >
                                {notification.type.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                              </span>
                              {notification.fromUserName && (
                                <span className="text-xs text-muted-foreground">
                                  from {notification.fromUserName}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="h-8 w-8 p-0"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            {notification.read && (
                              <CheckCheck className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}