import { LayoutDashboard, Building2, Users, FileImage, Monitor } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Services", url: "/", icon: LayoutDashboard },
  { title: "Organizations", url: "/dshub/organizations", icon: Building2 },
  { title: "Users", url: "/dshub/users", icon: Users },
  { title: "Screens", url: "/screens", icon: Monitor },
  // { title: "Canva old", url: "/templates", icon: FileImage },
  { title: "Canva Template", url: "/canva-templates", icon: FileImage },
];

export function AppSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end
                      onClick={handleMenuClick}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "hover:bg-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
