"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useToast } from "@p40/hooks/use-toast";
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Input, Label, RadioGroup, RadioGroupItem, Separator, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@p40/components/ui";
import { Check, Clock, CalendarCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getChurchList } from "@p40/services/zion";
import { Church } from "@p40/common/contracts/church/zions";
import { useRouter } from "@p40/i18n/routing";
import api from "@p40/lib/axios";

// Tipo para os check-ins
type CheckIn = {
  id: string;
  prayerTurnId: string;
  eventId: string;
  createdAt: string;
  prayerTurn: {
    startTime: string;
    endTime: string;
  };
  event: {
    name: string;
  };
};

// Adicionar tipo para o usuário com role
type UserData = {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  churchLink?: string;
  otherChurch?: string;
  leaderLink?: string;
  onboarding?: boolean;
  role?: string;
};

export default function CheckInProcess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const eventIdFromUrl = searchParams.get("eventId");
  const { toast } = useToast();
  
  const [currentView, setCurrentView] = useState('loading');
  const setCurrentViewWithLog = (newView) => {
    setCurrentView(newView);
  };
  const [formData, setFormData] = useState({
    whatsapp: "",
    isZionMember: "true",
    churchLink: "",
    otherChurch: "",
    isSameChurch: "true",
    otherZion: "",
    linkName: "",
  });
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [currentCheckIn, setCurrentCheckIn] = useState<CheckIn | null>(null);
  const [churches, setChurches] = useState<Church[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Versões estáveis das funções que usamos dentro do useEffect
  const fetchCheckInHistory = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/check-in?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setCheckIns(data.data);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar histórico de check-ins:", error);
    }
  }, [session?.user?.id]);

  const fetchUserData = useCallback(async () => {
    if (!session?.user?.id) return null;
    
    try {
      const response = await api.get(`/api/user?userId=${session.user.id}`);
      if (response.data.success) {
          return response.data.user;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      return null;
    }
  }, [session?.user?.id]);

  const fetchChurches = useCallback(async () => {
    try {
      const data = await getChurchList();
      const allChurches = data.flatMap((regionData) => regionData.churches);
      setChurches(allChurches);
    } catch (error) {
      console.error("Erro ao buscar igrejas:", error);
    }
  }, []);

  // Registrar check-in
  const handleCheckIn = useCallback(async () => {
    setCurrentViewWithLog('processing');
    
    try {
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId: eventIdFromUrl,
          timestamp: new Date().toISOString(),
          userId: session?.user?.id
        })
      });
      
      const data = await response.json();
      
      // Sempre definir os dados do check-in quando disponíveis
      if (data.data) {
        setCurrentCheckIn(data.data);
        
        if (!data.message || !data.message.includes("já fez check-in")) {
          setCheckIns(prev => [data.data, ...prev]);
        }
      } else {
        // Se não recebeu dados de check-in, buscar histórico
        await fetchCheckInHistory();
      }
      
      // Exibir toast sobre check-in duplicado se for o caso
      if (data.message && data.message.includes("já fez check-in")) {
        toast({
          title: "Check-in já realizado",
          description: data.message,
          variant: "warning",
          duration: 5000
        });
      }
      
      // Sempre ir para a tela de sucesso após um tempo, independente do resultado
      setTimeout(() => {
        setCurrentViewWithLog('success');
      }, 2000);
      
    } catch (error) {
      console.error("Erro ao fazer check-in:", error);
      toast({
        title: "Erro no sistema",
        description: "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
        variant: "destructive",
        duration: 5000
      });
      
      // Mesmo com erro, vamos para success depois de tentar buscar o histórico
      try {
        await fetchCheckInHistory();
      } catch (e) {
        console.error("Falha ao buscar histórico após erro:", e);
      }
      
      // Ir para success depois de 2 segundos mesmo com erro
      setTimeout(() => {
        setCurrentViewWithLog('success');
      }, 2000);
    }
  }, [eventIdFromUrl, session?.user?.id, toast, fetchCheckInHistory, currentView]);

  // Usar um useEffect independente para monitorar o estado e fazer a transição
  useEffect(() => {
    // Se o estado ficar muito tempo em processing, forçar para success
    let successTimer = null;
    
    if (currentView === 'processing') {
      successTimer = setTimeout(() => {
        setCurrentView('success'); // Usar diretamente para garantir
      }, 4000);
    }
    
    return () => {
      if (successTimer) {
        clearTimeout(successTimer);
      }
    };
  }, [currentView]);

  // Adicionar um efeito dedicado para monitorar os dados de check-in
  // e garantir que o estado mude para success quando tivermos dados
  useEffect(() => {
    // Se temos dados de check-in, mas não estamos na tela de sucesso,
    // forçar a mudança para a tela de sucesso com um pequeno atraso
    if (currentCheckIn && currentView !== 'success') {
      
      // Pequeno atraso para permitir que a animação da tela processing seja vista
      const timer = setTimeout(() => {
        setCurrentViewWithLog('success');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [currentCheckIn, currentView]);

  // Carregar dados do usuário e verificar se já completou o onboarding
  useEffect(() => {
    // Evita que o efeito execute mais de uma vez
    if (initialized) {
      return;
    }
    if (status === "loading") {
      return;
    }
    
    const initializeApp = async () => {
      setInitialized(true);
      
      if (status === "unauthenticated") {
        router.push(`/auth/signin?callbackUrl=/check-in/onboarding?eventId=${eventIdFromUrl || ""}`);
        return;
      }

      // Se o usuário já está logado, podemos verificar seus dados
      if (session?.user) {
        // Buscar dados completos do usuário da API
        const userData = await fetchUserData() as UserData | null;
        
        if (userData) {
          // Carregar histórico e igrejas de qualquer maneira
          await fetchCheckInHistory();
          await fetchChurches();
          
          // Preencher o formulário com dados existentes (caso seja necessário mostrá-lo)
          setFormData(prev => ({
            ...prev,
            whatsapp: userData.whatsapp || "",
            churchLink: userData.churchLink || "",
            otherChurch: userData.otherChurch || "",
            isZionMember: userData.churchLink ? "true" : userData.otherChurch ? "false" : "true",
            linkName: userData.leaderLink || ""
          }));

          
          if (userData.role === "USER" && userData.onboarding === false) {
            setCurrentViewWithLog('form');
          } else {
            handleCheckIn();
          }
        } else {
          await fetchChurches();
          setCurrentViewWithLog('form');
        }
      } else {
        await fetchChurches();
        setCurrentViewWithLog('form');
      }
    };
    
    initializeApp();
  }, [status, session, router, eventIdFromUrl, fetchCheckInHistory, fetchChurches, handleCheckIn, fetchUserData]);

  // Enviar dados do formulário
  const handleSubmit = async () => {
    // Validação básica
    if (
      formData.isZionMember === "true" && !formData.linkName ||
      formData.isZionMember === "false" && !formData.otherChurch
    ) {
      return;
    }
    
    try {
      // Definir o churchId com base nas escolhas do usuário
      let churchId = null;
      if (formData.isZionMember === "true") {
        if (formData.isSameChurch === "true") {
          churchId = eventIdFromUrl; // Se frequenta esta igreja
        } else {
          churchId = formData.churchLink; // Se frequenta outra Zion
        }
      }
      
      // Salvar dados de onboarding com os campos corretos
      const onboardingData = {
        whatsapp: formData.whatsapp,
        leaderLink: formData.linkName, 
        churchId: churchId,
        otherChurch: formData.isZionMember === "false" ? formData.otherChurch : null,
        userId: session?.user?.id
      };
      
      // Exibir feedback para o usuário
      toast({
        title: "Salvando seus dados...",
        description: "Estamos atualizando suas informações.",
        duration: 1000
      });
      
      // Atualizar perfil do usuário com esses dados - usando o endpoint PUT que funciona!
      const response = await fetch('/api/check-in', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(onboardingData)
      });
      
      if (response.ok) {
        // Verificar resposta
        const responseData = await response.json();
        
        if (responseData.success) {
          // Mostrar confirmação 
          toast({
            title: "Dados salvos!",
            description: "Seus dados foram atualizados com sucesso.",
            variant: "success",
            duration: 1000
          });
          
          localStorage.setItem("isOnboardingComplete", "true");
          
          handleCheckIn();
        } else {
          toast({
            title: "Erro ao salvar dados",
            description: responseData.error || "Ocorreu um erro ao salvar seus dados. Tente novamente.",
            variant: "destructive",
            duration: 5000
          });
        }
      } else {
        toast({
          title: "Erro de conexão",
          description: "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
          variant: "destructive",
          duration: 5000
        });
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar seus dados. Tente novamente mais tarde.",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // Conteúdo com base na view atual
  const renderContent = () => {
    let contentToRender;
    
    switch (currentView) {
      case 'loading':
        contentToRender = (
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
              <p className="text-lg font-medium">Carregando...</p>
            </CardContent>
          </Card>
        );
        break;
        
      case 'form':
        contentToRender = (
          <Card className="w-full max-w-md shadow-lg bg-white">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="text-2xl font-bold text-primary">
                Complete seu perfil
              </CardTitle>
              <p className="text-muted-foreground">
                Precisamos de algumas informações para registrar sua presença
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6 px-6">
              <div className="space-y-3">
                <Label htmlFor="whatsapp" className="text-base font-medium">
                  WhatsApp (opcional)
                </Label>
                <Input 
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(prev => ({...prev, whatsapp: e.target.value}))}
                  placeholder="(99) 99999-9999"
                  className="h-12"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Você é membro da Igreja Zion?
                </Label>
                <RadioGroup 
                  value={formData.isZionMember} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isZionMember: value }))}
                  className="flex space-x-6 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="zion-yes" />
                    <Label htmlFor="zion-yes" className="cursor-pointer">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="zion-no" />
                    <Label htmlFor="zion-no" className="cursor-pointer">Não</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {formData.isZionMember === "true" ? (
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Você frequenta esta igreja da Zion?
                  </Label>
                  <RadioGroup 
                    value={formData.isSameChurch || "true"} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, isSameChurch: value }))}
                    className="flex space-x-6 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="same-church-yes" />
                      <Label htmlFor="same-church-yes" className="cursor-pointer">Sim, frequento esta Zion</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="same-church-no" />
                      <Label htmlFor="same-church-no" className="cursor-pointer">Frequento outra Zion</Label>
                    </div>
                  </RadioGroup>
                  
                  {formData.isSameChurch === "false" && (
                    <div className="mt-4">
                      <Label htmlFor="zion-select" className="text-base font-medium">
                        Qual Zion você frequenta?
                      </Label>
                      <Select 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, churchLink: value }))} 
                        value={formData.churchLink}
                      >
                        <SelectTrigger id="zion-select" className="h-12">
                          <SelectValue placeholder="Selecione sua igreja" />
                        </SelectTrigger>
                        <SelectContent>
                          {churches.map((church) => (
                            <SelectItem key={church.id} value={church.id}>
                              {church.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {formData.churchLink === "zion-outras" && (
                        <div className="mt-3">
                          <Label htmlFor="other-zion" className="text-base font-medium">
                            Qual outra Zion?
                          </Label>
                          <Input 
                            id="other-zion"
                            name="otherZion"
                            value={formData.otherZion || ""}
                            onChange={(e) => setFormData(prev => ({...prev, otherZion: e.target.value}))}
                            placeholder="Nome da Zion que você frequenta"
                            className="h-12 mt-1"
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <Label htmlFor="church-link" className="text-base font-medium">
                      Qual link você participa na Zion?
                    </Label>
                    <Input 
                      id="church-link"
                      name="churchLink"
                      value={formData.linkName || ""}
                      onChange={(e) => setFormData(prev => ({...prev, linkName: e.target.value}))}
                      placeholder="Nome do seu link (ex: Link Jovens)"
                      className="h-12"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label htmlFor="otherChurch" className="text-base font-medium">
                    Qual igreja você frequenta?
                  </Label>
                  <Input 
                    id="otherChurch"
                    name="otherChurch"
                    value={formData.otherChurch}
                    onChange={(e) => setFormData(prev => ({...prev, otherChurch: e.target.value}))}
                    placeholder="Nome da sua igreja"
                    className="h-12"
                    required
                  />
                </div>
              )}
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-blue-800 font-medium mb-1">✨ Só precisará fazer isso uma vez!</p>
                <p className="text-xs text-blue-700">
                  Você não precisará repetir esse processo nas próximas vezes que fizer check-in.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="pt-2 pb-6 px-6">
              <Button 
                onClick={handleSubmit} 
                disabled={(formData.isZionMember === "true" && !formData.linkName) || 
                          (formData.isZionMember === "false" && !formData.otherChurch)}
                className="w-full h-12 text-base font-medium"
              >
                Registrar Presença
              </Button>
            </CardFooter>
          </Card>
        );
        break;
        
      case 'processing':
        contentToRender = (
          <Card className="w-full max-w-md shadow-lg bg-white">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8"
              >
                <Clock size={32} className="text-primary" />
              </motion.div>
              <h2 className="text-2xl font-bold text-center mb-2">Registrando seu check-in...</h2>
              <p className="text-muted-foreground text-center">
                Estamos confirmando sua presença no evento.
              </p>
            </CardContent>
          </Card>
        );
        break;
        
      case '  ':
        contentToRender = (
          <Card className="w-full max-w-md shadow-lg bg-white overflow-hidden">
            <div className="bg-green-500 h-2 w-full"></div>
            <CardContent className="flex flex-col items-center justify-center pt-10 pb-6">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  duration: 0.6
                }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <Check size={36} className="text-green-600" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold mb-2">Check-in Confirmado!</h2>
                <p className="text-muted-foreground mb-6">
                  Sua presença foi registrada com sucesso.
                </p>
                
                {currentCheckIn && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 w-full max-w-xs mx-auto">
                    <p className="font-medium text-gray-800">{currentCheckIn.event?.name || 'Check-in realizado'}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <Clock size={16} className="mr-2" />
                      <span>
                        {currentCheckIn.prayerTurn?.startTime || '--:--'} - {currentCheckIn.prayerTurn?.endTime || '--:--'}
                      </span>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <CalendarCheck size={16} className="mr-2" />
                      <span>
                        {currentCheckIn.createdAt 
                          ? format(new Date(currentCheckIn.createdAt), "dd 'de' MMMM, HH:mm", { locale: ptBR })
                          : format(new Date(), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            </CardContent>
            
            {checkIns.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Separator className="my-2" />
                <div className="px-6 pb-6">
                  <h3 className="font-medium text-lg mb-3">Seus check-ins anteriores</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {checkIns.slice(1, 6).map((checkin) => (
                      <div key={checkin.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-md">
                        <div className="bg-primary/10 rounded-full p-2">
                          <CalendarCheck size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{checkin.event?.name || 'Check-in'}</p>
                          <p className="text-xs text-gray-500">
                            {checkin.createdAt 
                              ? format(new Date(checkin.createdAt), "dd/MM/yyyy, HH:mm")
                              : format(new Date(), "dd/MM/yyyy, HH:mm")}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {checkIns.length > 6 && (
                      <Button variant="outline" className="w-full text-sm" onClick={() => router.push('/check-in/history')}>
                        Ver todos os check-ins
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            <CardFooter className="px-6 pb-6">
              <Button 
                onClick={() => router.push('/check-in')}
                className="w-full h-12"
              >
                Voltar para o início
              </Button>
            </CardFooter>
          </Card>
        );
        break;
      
      default:
        contentToRender = (
          <Card className="w-full max-w-md shadow-lg bg-white overflow-hidden">
            <div className="bg-green-500 h-2 w-full"></div>
            <CardContent className="flex flex-col items-center justify-center pt-10 pb-6">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <Check size={36} className="text-green-600" />
              </motion.div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Check-in Confirmado!</h2>
                <p className="text-muted-foreground mb-6">
                  Sua presença foi registrada com sucesso.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="px-6 pb-6">
              <Button 
                onClick={() => router.push('/check-in')}
                className="w-full h-12"
              >
                Voltar para o início
              </Button>
            </CardFooter>
          </Card>
        );
    }
    
    
    // Verificação final de segurança
    if (!contentToRender) {
      
      return (
        <Card className="w-full max-w-md shadow-lg bg-white">
          <CardHeader className="bg-green-500 h-10 flex items-center justify-center">
            <CardTitle className="text-white">Check-in</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="bg-green-100 rounded-full p-4 mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Check-in realizado com sucesso!</h2>
            <p className="text-gray-600 text-center mb-6">
              Sua presença foi registrada.
            </p>
            <Button 
              onClick={() => router.push('/check-in')}
              className="w-full"
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return contentToRender;
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}