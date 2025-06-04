import {Dispatch, SetStateAction} from "react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {AlertTriangle, ArrowLeft, ChevronRight, User as UserIcon} from "lucide-react";
import {LayerType} from "@/components/layout/AuthLayout/Sidebar/Sidebar";
import {User} from "@/contexts/AuthContext";

interface SettingsProps {
  user: User | null
  activeLayer: LayerType
  setActiveLayer: Dispatch<SetStateAction<LayerType>>
}

const Settings: React.FC<SettingsProps> = ({ user, activeLayer, setActiveLayer }) => {
  const settingsOptions = [
    { id: 301, name: "Account", icon: <UserIcon className="h-5 w-5" /> },
    { id: 302, name: "Active sessions", icon: <AlertTriangle className="h-5 w-5" />, onClick: () => setActiveLayer('active_sessions') },
  ];

  return (
    <div
      className={cn(
        "absolute inset-0 h-full border-r bg-background flex flex-col transition-transform duration-300 ease-in-out",
        activeLayer === 'settings' ? "translate-x-0 z-20" : "translate-x-full z-10"
      )}
    >
      <div className="p-3 border-b flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setActiveLayer('main')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-medium">Settings</h2>
      </div>
      <div className="p-4 border-b flex items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl">
          {user?.username?.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-lg">{user?.username}</div>
          <div className="text-sm text-muted-foreground">{user?.name}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {settingsOptions.map((option) => (
          <Button
            disabled={!option.onClick}
            key={option.id}
            variant="ghost"
            className="w-full justify-start px-4 py-3 h-14 rounded-none"
            onClick={option?.onClick}
          >
            <div className="mr-3">{option.icon}</div>
            <span>{option.name}</span>
            <ChevronRight className="ml-auto h-4 w-4" />
          </Button>
        ))}
      </div>
    </div>
  )
}

export default Settings