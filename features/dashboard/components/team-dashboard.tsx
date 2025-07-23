import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@chat/ui';
import { 
  IconChecklist, 
  IconClock,
  IconUsers,
  IconMessage,
  IconCalendar,
  IconTrendingUp
} from '@tabler/icons-react';

export function TeamDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your tasks and collaborate with clients
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
            <IconChecklist className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">5 due this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 need updates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">4 with active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <IconMessage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 unread</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5" />
              Today's Tasks
            </CardTitle>
            <CardDescription>Tasks scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { task: 'Review homepage mockup', client: 'Acme Corp', priority: 'high' },
                { task: 'Update project timeline', client: 'TechStart', priority: 'medium' },
                { task: 'Client call preparation', client: 'Global Solutions', priority: 'high' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.task}</p>
                    <p className="text-xs text-muted-foreground">{item.client}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md ${
                    item.priority === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="h-5 w-5" />
              Recent Project Updates
            </CardTitle>
            <CardDescription>Latest activity across your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { update: 'Client approved logo design', project: 'Acme Rebrand', time: '2 hours ago' },
                { update: 'New feedback on wireframes', project: 'TechStart Website', time: '4 hours ago' },
                { update: 'Meeting notes added', project: 'Global Campaign', time: '1 day ago' }
              ].map((item, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <p className="font-medium text-sm">{item.update}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">{item.project}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}