import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export const usePortal = () => {
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const portalElement = document.createElement('div');
    portalElement.setAttribute('id', 'modal-portal');
    document.body.appendChild(portalElement);
    portalRef.current = portalElement;

    return () => {
      if (portalRef.current) {
        document.body.removeChild(portalRef.current);
      }
    };
  }, []);

  const Portal = ({ children }: { children: React.ReactNode }) => {
    if (!portalRef.current) return null;
    return createPortal(children, portalRef.current);
  };

  return Portal;
};