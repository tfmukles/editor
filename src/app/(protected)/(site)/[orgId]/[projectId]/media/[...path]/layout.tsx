import DragWrapper from "./_components/drag-wrapper";
import MediaHeader from "./_components/media-header";

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DragWrapper>
      <MediaHeader />
      {children}
    </DragWrapper>
  );
}
