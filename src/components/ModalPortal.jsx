import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom"

function createWrapperAndAppendToBody(wrapperId) {
  const wrapperElement = document.createElement('div');
  wrapperElement.setAttribute("id", wrapperId);
  document.body.appendChild(wrapperElement);
  return wrapperElement;
}

const ModelPortal = ({children, wrappedId}) => {

    const [wrappedElement, setWrappedElement] = useState();

    useLayoutEffect(() => {
      let element = document.getElementById(wrappedId);
      let systemCreated = false;

      if(!element) {
        systemCreated = true
        element = createWrapperAndAppendToBody(wrappedId)
      }
      setWrappedElement(element);

      return () => {
        if(systemCreated && element?.parentNode) {
          element.parentNode.removeChild(element);
        }
      }
    }, [wrappedId])

    if(!wrappedElement) return null;
    return createPortal(children, wrappedElement)
}

export default ModelPortal