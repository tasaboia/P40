"use client";

import { useState, useRef, useEffect, ReactNode, useMemo } from "react";
import * as UI from "@p40/components/ui/index";
import { usePathname } from "@p40/i18n/routing";
import { useRouter } from "next/navigation";
import { toast } from "@p40/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  console.log(filteredTabs);
  const indexInicial = filteredTabs.findIndex((tabs) =>
    tabs.route.url.includes(path.replace(/\//g, ""))
  );

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(indexInicial);
  const [activeIndex, setActiveIndex] = useState(indexInicial);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const initialRender = useRef(true);

  // Detectar se estamos em um dispositivo móvel
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Função para rolar para a tab ativa no mobile
  useEffect(() => {
    if (isMobile && activeIndex !== -1 && scrollContainerRef.current && tabRefs.current[activeIndex]) {
      const container = scrollContainerRef.current;
      const activeTab = tabRefs.current[activeIndex];
      
      if (activeTab) {
        // Rolar para centralizar a tab ativa
        const containerWidth = container.offsetWidth;
        const tabWidth = activeTab.offsetWidth;
        const tabLeft = activeTab.offsetLeft;
        
        container.scrollTo({
          left: tabLeft - (containerWidth / 2) + (tabWidth / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex, isMobile]);

  useEffect(() => {
    if (hoveredIndex !== null && !isCheckinPath && !isMobile) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex, isCheckinPath, isMobile]);

  console.log(filteredTabs[activeIndex].route.url);
  console.log(eventId);
  useEffect(() => {
    if (isCheckinPath) return;
    
    const activeElement = tabRefs.current[activeIndex];
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      
      // No mobile, não usamos o activeStyle para a linha inferior
      if (!isMobile) {
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
      
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
  }, [activeIndex, router, isCheckinPath, eventId, filteredTabs, isMobile]);

  // Funções para navegar entre tabs no mobile
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -100, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  };

  if (isCheckinPath) {
    return <div className="container h-full w-screen">{children}</div>;
  }

  return (
    <div className={`flex flex-col w-full ${isDarkMode ? "dark bg-[#0e0f11]" : ""}`}>
      <UI.Card className={`w-full max-w-[1200px] h-10 px-2 border-none shadow-none relative flex ${isDarkMode ? "bg-transparent" : ""}`}>
        <UI.CardContent className="p-0 w-full">
          <div className="relative w-full flex items-center">
            {isMobile && filteredTabs.length > 3 && (
              <button 
                className="absolute left-0 z-10 bg-background/80 backdrop-blur-sm p-1 rounded-full shadow-sm"
                onClick={scrollLeft}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            
            {/* Apenas no desktop mostramos o fundo de hover */}
            {!isMobile && (
              <div
                className="absolute h-[30px] transition-all duration-300 ease-out bg-[#0e0f1114] dark:bg-[#ffffff1a] rounded-[6px] flex items-center"
                style={{
                  ...hoverStyle,
                  opacity: hoveredIndex !== null ? 1 : 0,
                }}
              />
            )}
            
            {/* Apenas no desktop mostramos a linha de ativo */}
            {!isMobile && (
              <div
                className="absolute bottom-[-6px] h-[2px] bg-[#0e0f11] dark:bg-white transition-all duration-300 ease-out"
                style={activeStyle}
              />
            )}

            <div 
              ref={scrollContainerRef}
              className="relative w-full overflow-x-auto scrollbar-none flex items-center"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex min-w-max px-4 md:px-0">
                {filteredTabs.map((tab, index) => (
                  <div
                    key={index}
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    className={`
                      px-2 py-2 cursor-pointer transition-colors duration-300 h-[30px]
                      ${index === activeIndex 
                        ? isMobile 
                          ? "text-primary border-b-2 border-primary font-medium" 
                          : "text-[#0e0e10] dark:text-white"
                        : "text-[#0e0f1199] dark:text-[#ffffff99]"
                      }
                    `}
                    onMouseEnter={() => !isMobile && setHoveredIndex(index)}
                    onMouseLeave={() => !isMobile && setHoveredIndex(null)}
                    onClick={() => setActiveIndex(index)}
                  >
                    <div className="text-xs font-bold font-[var(--www-mattmannucci-me-geist-regular-font-family)] leading-5 whitespace-nowrap flex items-center justify-center h-full">
                      {tab.indexTitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {isMobile && filteredTabs.length > 3 && (
              <button 
                className="absolute right-0 z-10 bg-background/80 backdrop-blur-sm p-1 rounded-full shadow-sm"
                onClick={scrollRight}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </UI.CardContent>
      </UI.Card>

      <div>{children}</div>
    </div>
  );
}
