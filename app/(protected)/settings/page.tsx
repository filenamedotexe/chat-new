import { getUser } from '@/lib/auth/get-user';
import { redirect } from 'next/navigation';
import { 
  ProfileTab, 
  AppearanceTab, 
  NotificationsTab, 
  SecurityTab, 
  EmailTab 
} from '@/features/settings/components/settings-tabs';
import { SettingsLayout, MobileSettingsTabs } from '@/features/settings/components/settings-layout';
import { BetaFeaturesSection } from './beta-features-section';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  const currentTab = searchParams.tab || 'profile';

  const TabContent = () => {
    switch(currentTab) {
      case 'profile':
        return <ProfileTab session={{ user }} />;
      case 'appearance':
        return <AppearanceTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'security':
        return <SecurityTab />;
      case 'email':
        return <EmailTab />;
      case 'beta':
        return <BetaFeaturesSection />;
      default:
        return <ProfileTab session={{ user }} />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      {/* Desktop: Sidebar Layout */}
      <div className="hidden lg:block">
        <SettingsLayout>
          <TabContent />
        </SettingsLayout>
      </div>
      
      {/* Mobile: Tab Layout */}
      <div className="lg:hidden">
        <MobileSettingsTabs>
          <TabContent />
        </MobileSettingsTabs>
      </div>
    </div>
  );
}