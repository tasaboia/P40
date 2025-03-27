"use client";

import { useState, useRef, useEffect, ReactNode, useMemo } from "react";
import * as UI from "@p40/components/ui/index";
import { usePathname } from "@p40/i18n/routing";
import { useRouter } from "next/navigation";
import { toast } from "@p40/hooks/use-toast";

interface DashboardWrapperProps {
  children: ReactNode;
  eventId?: string;
  filteredTabs: {
    indexTitle: string;
    role: string[];
    route: {
      url: string;
      params?: string;
    };
  }[];
}

export default function DashboardWrapper({
  children,
  filteredTabs,
  eventId,
}: DashboardWrapperProps) {
  const router = useRouter();
  const path = usePathname();
  const isCheckinPath = path.includes("check-in");

  const indexInicial = filteredTabs.findIndex((tabs) =>
    tabs.route.url.includes(path.replace(/\//g, ""))
  );

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(indexInicial);
  const [activeIndex, setActiveIndex] = useState(indexInicial);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const initialRender = useRef(true);

  useEffect(() => {
    if (hoveredIndex !== null && !isCheckinPath) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex, isCheckinPath]);

  useEffect(() => {
    if (isCheckinPath) return;
    
    const activeElement = tabRefs.current[activeIndex];
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
      if (initialRender.current === false) {
        if (filteredTabs[activeIndex].route.params == "eventId") {
          if (eventId) {
            router.push(`/${filteredTabs[activeIndex].route.url}/${eventId}`);
          } else {
            toast({
              title: "Erro ao buscar pautas de oração",
              variant: "destructive",
            });
          }
        } else {
          router.push(`/${filteredTabs[activeIndex].route.url}`);
        }
      }
      initialRender.current = false;
    }
  }, [activeIndex, router, isCheckinPath, eventId, filteredTabs]);

  if (isCheckinPath) {
    return <div className="container h-full w-screen">{children}</div>;
  }

  return (
    <div
      className={`flex flex-col  w-full   ${
        isDarkMode ? "dark bg-[#0e0f11]" : ""
      }`}
    >
      <UI.Card
        className={`w-full max-w-[1200px] h-10 px-2 border-none shadow-none relative flex ${
          isDarkMode ? "bg-transparent" : ""
        }`}
      >
        <UI.CardContent className="p-0">
          <div className="relative">
            <div
              className="absolute h-[30px] transition-all duration-300 ease-out bg-[#0e0f1114] dark:bg-[#ffffff1a] rounded-[6px] flex items-center"
              style={{
                ...hoverStyle,
                opacity: hoveredIndex !== null ? 1 : 0,
              }}
            />

            <div
              className="absolute bottom-[-6px] h-[2px] bg-[#0e0f11] dark:bg-white transition-all duration-300 ease-out"
              style={activeStyle}
            />

            <div className="relative overflow-auto flex  items-center">
              {filteredTabs.map((tab, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  className={`px-2 py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
                    index === activeIndex
                      ? "text-[#0e0e10] dark:text-white"
                      : "text-[#0e0f1199] dark:text-[#ffffff99]"
                  }`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setActiveIndex(index)}
                >
                  <div className="text-xs font-bold font-[var(--www-mattmannucci-me-geist-regular-font-family)] leading-5 whitespace-nowrap flex items-center justify-center h-full">
                    {tab.indexTitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </UI.CardContent>
      </UI.Card>

      <div>{children}</div>
    </div>
  );
}
