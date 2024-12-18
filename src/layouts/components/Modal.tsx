import { RefObject, useEffect, useRef } from "react";

const Modal = ({
  toggle,
  buttonRef,
  children,
  className,
}: {
  toggle?: () => void;
  buttonRef?: RefObject<HTMLButtonElement>;
  children: React.ReactNode;
  className: string;
  isSchemaExit?: boolean;
}) => {
  const wrapper = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function closeOnOutsideClick(e: MouseEvent) {
      if (!wrapper.current || !buttonRef?.current) return;
      const element = e.target as HTMLElement;
      const shouldClose =
        !wrapper.current.contains(element) &&
        !buttonRef.current?.contains(element);
      if (shouldClose && toggle) toggle();
    }

    window.addEventListener("click", closeOnOutsideClick);
    return () => window.removeEventListener("click", closeOnOutsideClick);
  }, [buttonRef, toggle]);

  return (
    <div ref={wrapper}>
      <div className={className}>{children}</div>
    </div>
  );
};

export default Modal;
