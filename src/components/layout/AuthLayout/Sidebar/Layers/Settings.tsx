import {Dispatch, ReactNode, SetStateAction} from "react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {AlertTriangle, ArrowLeft, ChevronRight, Info, Megaphone, Moon, User} from "lucide-react";
import {Input} from "@/components/ui/input";
import {LayerType} from "@/components/layout/AuthLayout/Sidebar/Sidebar";

interface SettingsProps {
  activeLayer: LayerType
  setActiveLayer: Dispatch<SetStateAction<LayerType>>
}

const Settings: React.FC<SettingsProps> = ({ activeLayer, setActiveLayer }) => {
  const settingsOptions = [
    { id: 301, name: "Account", icon: <User className="h-5 w-5" /> },
    { id: 302, name: "Privacy & Security", icon: <AlertTriangle className="h-5 w-5" /> },
    { id: 303, name: "Notifications", icon: <Megaphone className="h-5 w-5" /> },
    { id: 304, name: "Appearance", icon: <Moon className="h-5 w-5" /> },
    { id: 305, name: "Language", icon: <Info className="h-5 w-5" /> },
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
          К
        </div>
        <div>
          <div className="font-medium text-lg">котакбас 1992</div>
          <div className="text-sm text-muted-foreground">+1 234 567 8900</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {settingsOptions.map((option) => (
          <Button
            key={option.id}
            variant="ghost"
            className="w-full justify-start px-4 py-3 h-14 rounded-none"
          >
            <div className="mr-3">{option.icon}</div>
            <span>{option.name}</span>
            <ChevronRight className="ml-auto h-4 w-4" />
          </Button>
        ))}
        {/*<div className="p-4">*/}
        {/*  <Button*/}
        {/*    variant="ghost"*/}
        {/*    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"*/}
        {/*    onClick={() => {*/}
        {/*      currentTheme === "dark" ?*/}
        {/*        cookies.set('theme', 'light') :*/}
        {/*        cookies.set('theme', 'dark')*/}
        {/*      window.location.reload();*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    <Moon className="h-5 w-5 mr-2" />*/}
        {/*    {currentTheme === "dark" ? "Disable Dark Mode" : "Enable Dark Mode"}*/}
        {/*  </Button>*/}
        {/*</div>*/}
      </div>
    </div>
  )
}

export default Settings