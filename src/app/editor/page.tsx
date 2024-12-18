import { Toaster } from 'sonner';

import { PlateEditor } from '@/layouts/components/editor/plate-editor';
import { SettingsProvider } from '@/layouts/components/editor/settings';

export default function Page() {
  return (
    <div className="h-screen w-full" data-registry="plate">
      <SettingsProvider>
        <PlateEditor />
      </SettingsProvider>

      <Toaster />
    </div>
  );
}
