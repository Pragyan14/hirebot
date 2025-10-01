import { useEffect, useRef } from 'react';

export const useAutoScroll = (dependency) => {
    const scrollRef = useRef(null);
    
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [dependency]);
    
    return scrollRef;
};