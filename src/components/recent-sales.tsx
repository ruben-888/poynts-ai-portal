import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/01.png" alt="Avatar" />
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Acme Corp</p>
          <p className="text-sm text-muted-foreground">
            Updated reward catalog
          </p>
        </div>
        <div className="ml-auto font-medium">Just now</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/02.png" alt="Avatar" />
          <AvatarFallback>TB</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">TechBridge Inc</p>
          <p className="text-sm text-muted-foreground">Bulk gift card order</p>
        </div>
        <div className="ml-auto font-medium">5m ago</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/03.png" alt="Avatar" />
          <AvatarFallback>GS</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Global Systems</p>
          <p className="text-sm text-muted-foreground">
            API integration update
          </p>
        </div>
        <div className="ml-auto font-medium">20m ago</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/04.png" alt="Avatar" />
          <AvatarFallback>RS</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Reward Solutions</p>
          <p className="text-sm text-muted-foreground">
            New provider connection
          </p>
        </div>
        <div className="ml-auto font-medium">1h ago</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/05.png" alt="Avatar" />
          <AvatarFallback>MP</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Mega Partners</p>
          <p className="text-sm text-muted-foreground">
            Member data sync completed
          </p>
        </div>
        <div className="ml-auto font-medium">3h ago</div>
      </div>
    </div>
  );
}
