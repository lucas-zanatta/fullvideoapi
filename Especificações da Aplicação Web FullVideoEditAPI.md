# Especificações da Aplicação Web FullVideoEditAPI

## 1. Visão Geral da Aplicação Web

A aplicação web do FullVideoEditAPI servirá como interface de usuário para gerenciar vídeos gerados, templates, configurações de conta e, futuramente, planos de monetização. A aplicação será desenvolvida com foco na experiência do usuário, seguindo as melhores práticas de design responsivo e acessibilidade.

## 2. Arquitetura da Aplicação Web

### 2.1. Stack Tecnológica

**Frontend:**
- **Framework**: React.js 18+ com TypeScript
- **Roteamento**: React Router v6
- **Estado Global**: Zustand ou Context API
- **UI Components**: Tailwind CSS + Headless UI
- **Formulários**: React Hook Form + Zod (validação)
- **HTTP Client**: Axios
- **Build Tool**: Vite

**Backend (Extensão da API Principal):**
- **Framework**: FastAPI (mesmo da API principal)
- **Autenticação**: JWT tokens
- **Banco de Dados**: PostgreSQL (compartilhado com a API)
- **Upload de Arquivos**: Integração com Minio/S3

### 2.2. Estrutura de Diretórios

```
web-app/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── forms/
│   │   ├── layout/
│   │   └── video/
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── VideoLibrary.tsx
│   │   ├── Templates.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── App.tsx
├── public/
├── package.json
└── tailwind.config.js
```

## 3. Funcionalidades da Aplicação

### 3.1. Página Inicial (Home) - Pública

**Objetivo**: Apresentar o FullVideoEditAPI e suas funcionalidades para visitantes não autenticados.

**Seções:**
- **Hero Section**: Apresentação principal com call-to-action
- **Recursos Principais**: Destaque das funcionalidades da API
- **Como Funciona**: Explicação do processo de geração de vídeo
- **Integração com n8n**: Destaque da integração nativa
- **Planos e Preços**: (Futura) Apresentação dos planos de monetização
- **Testemunhos**: (Futura) Depoimentos de usuários
- **Footer**: Links úteis, contato e informações legais

**Componentes:**
```tsx
// Hero Section
const HeroSection = () => (
  <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
    <div className="container mx-auto px-4 text-center">
      <h1 className="text-5xl font-bold mb-6">
        Automação de Vídeo Simplificada
      </h1>
      <p className="text-xl mb-8">
        Crie vídeos dinâmicos automaticamente através da nossa API 
        e integração nativa com n8n
      </p>
      <div className="space-x-4">
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold">
          Começar Gratuitamente
        </button>
        <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold">
          Ver Documentação
        </button>
      </div>
    </div>
  </section>
);
```

### 3.2. Sistema de Autenticação

**Login/Registro:**
- **Modal de Login**: Popup ativado apenas quando o usuário clicar em "Entrar"
- **Registro**: Formulário simples com email, senha e confirmação
- **Recuperação de Senha**: Sistema de reset via email
- **Autenticação Social**: (Futura) Login com Google/GitHub

**Componentes de Autenticação:**
```tsx
interface LoginFormData {
  email: string;
  password: string;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authService.login(data);
      localStorage.setItem('token', response.token);
      // Redirect to dashboard
    } catch (error) {
      // Handle error
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register('email', { required: 'Email é obrigatório' })}
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded-lg"
        />
        {errors.email && <span className="text-red-500">{errors.email.message}</span>}
        
        <input
          {...register('password', { required: 'Senha é obrigatória' })}
          type="password"
          placeholder="Senha"
          className="w-full p-3 border rounded-lg"
        />
        {errors.password && <span className="text-red-500">{errors.password.message}</span>}
        
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg">
          Entrar
        </button>
      </form>
    </Modal>
  );
};
```

### 3.3. Dashboard do Usuário

**Objetivo**: Página principal após login, mostrando resumo da conta e atividades recentes.

**Funcionalidades:**
- **Resumo da Conta**: Estatísticas de uso (vídeos gerados, tempo total, etc.)
- **Atividade Recente**: Lista dos últimos vídeos gerados
- **Acesso Rápido**: Links para funcionalidades principais
- **Status da API**: Indicador de saúde da API
- **Limites de Uso**: (Futura) Progresso em relação aos limites do plano

**Layout:**
```tsx
const Dashboard = () => {
  const { user, stats } = useUserData();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Bem-vindo, {user.name}!
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Vídeos Gerados"
          value={stats.videosGenerated}
          icon={<VideoIcon />}
        />
        <StatsCard
          title="Tempo Total"
          value={`${stats.totalDuration} min`}
          icon={<ClockIcon />}
        />
        <StatsCard
          title="Este Mês"
          value={stats.thisMonth}
          icon={<CalendarIcon />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentVideos />
        <QuickActions />
      </div>
    </div>
  );
};
```

### 3.4. Biblioteca de Vídeos

**Objetivo**: Gerenciar todos os vídeos gerados pelo usuário.

**Funcionalidades:**
- **Lista de Vídeos**: Grid responsivo com thumbnails
- **Filtros**: Por data, duração, status
- **Busca**: Por nome ou tags
- **Ações**: Visualizar, baixar, excluir, compartilhar
- **Detalhes**: Informações técnicas do vídeo
- **Regenerar**: Opção para reprocessar vídeo com novos parâmetros

**Componentes:**
```tsx
interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  createdAt: string;
  status: 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  metadata: {
    resolution: string;
    format: string;
    size: number;
  };
}

const VideoLibrary = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Biblioteca de Vídeos</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Novo Vídeo
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar vídeos..."
        />
        <FilterSelect
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'completed', label: 'Concluídos' },
            { value: 'processing', label: 'Processando' },
            { value: 'failed', label: 'Falharam' }
          ]}
        />
      </div>
      
      <VideoGrid videos={filteredVideos} />
    </div>
  );
};
```

### 3.5. Editor de Templates

**Objetivo**: Criar e gerenciar templates de vídeo reutilizáveis.

**Funcionalidades:**
- **Lista de Templates**: Templates salvos pelo usuário
- **Editor Visual**: Interface para criar templates (versão simplificada)
- **Editor JSON**: Modo avançado para edição direta do JSON
- **Preview**: Visualização prévia do template
- **Compartilhamento**: (Futura) Compartilhar templates com outros usuários

**Estrutura do Template:**
```tsx
interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  structure: {
    scenes: Scene[];
    defaultSettings: {
      resolution: string;
      format: string;
      duration: number;
    };
    textStyles: TextStyle[];
    transitions: Transition[];
  };
  variables: TemplateVariable[];
  createdAt: string;
  updatedAt: string;
}

const TemplateEditor = () => {
  const [template, setTemplate] = useState<VideoTemplate>();
  const [mode, setMode] = useState<'visual' | 'json'>('visual');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Editor de Templates</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('visual')}
            className={`px-4 py-2 rounded ${mode === 'visual' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Visual
          </button>
          <button
            onClick={() => setMode('json')}
            className={`px-4 py-2 rounded ${mode === 'json' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            JSON
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {mode === 'visual' ? (
            <VisualTemplateEditor template={template} onChange={setTemplate} />
          ) : (
            <JsonTemplateEditor template={template} onChange={setTemplate} />
          )}
        </div>
        <div>
          <TemplatePreview template={template} />
        </div>
      </div>
    </div>
  );
};
```

### 3.6. Configurações da Conta

**Objetivo**: Gerenciar configurações pessoais e da conta.

**Seções:**
- **Perfil**: Nome, email, foto de perfil
- **Segurança**: Alterar senha, 2FA (futura)
- **API Keys**: Gerenciar chaves de API
- **Notificações**: Preferências de notificação
- **Plano**: (Futura) Informações do plano atual e upgrade
- **Faturamento**: (Futura) Histórico de pagamentos

**Componente de API Keys:**
```tsx
const ApiKeysSection = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const createApiKey = async (name: string) => {
    try {
      const newKey = await apiService.createKey({ name });
      setApiKeys([...apiKeys, newKey]);
      setShowCreateForm(false);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Chaves de API</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Nova Chave
        </button>
      </div>
      
      <div className="space-y-3">
        {apiKeys.map(key => (
          <div key={key.id} className="flex justify-between items-center p-3 border rounded">
            <div>
              <div className="font-medium">{key.name}</div>
              <div className="text-sm text-gray-500">
                Criada em {formatDate(key.createdAt)}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="text-blue-600 hover:underline">
                Copiar
              </button>
              <button className="text-red-600 hover:underline">
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {showCreateForm && (
        <CreateApiKeyForm
          onSubmit={createApiKey}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};
```

## 4. Sistema de Monetização (Futura)

### 4.1. Planos de Assinatura

**Plano Gratuito:**
- 10 vídeos por mês
- Resolução máxima 720p
- Duração máxima 2 minutos
- Marca d'água

**Plano Básico ($9.99/mês):**
- 100 vídeos por mês
- Resolução até 1080p
- Duração máxima 10 minutos
- Sem marca d'água

**Plano Pro ($29.99/mês):**
- 500 vídeos por mês
- Resolução até 4K
- Duração ilimitada
- Templates premium
- Suporte prioritário

**Plano Enterprise (Personalizado):**
- Vídeos ilimitados
- API dedicada
- SLA garantido
- Suporte 24/7

### 4.2. Sistema de Pagamentos

**Integração com Stripe:**
```tsx
const PricingPlans = () => {
  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 0,
      features: ['10 vídeos/mês', '720p', '2 min máx', 'Marca d\'água']
    },
    {
      id: 'basic',
      name: 'Básico',
      price: 9.99,
      features: ['100 vídeos/mês', '1080p', '10 min máx', 'Sem marca d\'água']
    },
    // ... outros planos
  ];

  const handleSubscribe = async (planId: string) => {
    try {
      const { sessionId } = await paymentService.createCheckoutSession(planId);
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plans.map(plan => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onSubscribe={() => handleSubscribe(plan.id)}
        />
      ))}
    </div>
  );
};
```

## 5. Responsividade e Acessibilidade

### 5.1. Design Responsivo

**Breakpoints (Tailwind CSS):**
- **sm**: 640px (mobile landscape)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop)

**Componentes Responsivos:**
```tsx
const ResponsiveGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {children}
  </div>
);

const ResponsiveNavigation = () => (
  <nav className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
    {/* Navigation items */}
  </nav>
);
```

### 5.2. Acessibilidade

**Práticas Implementadas:**
- **Semantic HTML**: Uso correto de elementos semânticos
- **ARIA Labels**: Rótulos para elementos interativos
- **Keyboard Navigation**: Navegação completa via teclado
- **Color Contrast**: Contraste adequado para legibilidade
- **Screen Reader Support**: Compatibilidade com leitores de tela

```tsx
const AccessibleButton = ({ children, onClick, disabled }: ButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 bg-blue-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    aria-label={typeof children === 'string' ? children : undefined}
  >
    {children}
  </button>
);
```

## 6. Performance e Otimização

### 6.1. Otimizações de Performance

**Code Splitting:**
```tsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const VideoLibrary = lazy(() => import('./pages/VideoLibrary'));

const App = () => (
  <Router>
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/videos" element={<VideoLibrary />} />
      </Routes>
    </Suspense>
  </Router>
);
```

**Image Optimization:**
```tsx
const OptimizedImage = ({ src, alt, ...props }: ImageProps) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    className="object-cover"
    {...props}
  />
);
```

### 6.2. Caching e Estado

**React Query para Cache:**
```tsx
const useVideos = () => {
  return useQuery({
    queryKey: ['videos'],
    queryFn: () => videoService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

## 7. Testes

### 7.1. Estratégia de Testes

**Tipos de Teste:**
- **Unit Tests**: Componentes individuais (Jest + React Testing Library)
- **Integration Tests**: Fluxos completos
- **E2E Tests**: Cypress para testes end-to-end

**Exemplo de Teste:**
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginModal } from './LoginModal';

describe('LoginModal', () => {
  it('should submit form with correct data', async () => {
    const mockOnSubmit = jest.fn();
    render(<LoginModal isOpen={true} onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Senha'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByText('Entrar'));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});
```

## 8. Deployment

### 8.1. Build e Deploy

**Build Process:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:e2e": "cypress run"
  }
}
```

**Docker Configuration:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 8.2. Integração com EasyPanel

A aplicação web será implantada como um container adicional no EasyPanel, servindo arquivos estáticos via Nginx e comunicando-se com a API backend através da rede interna do Docker.

Esta especificação fornece uma base sólida para o desenvolvimento da aplicação web do FullVideoEditAPI, considerando tanto o uso atual quanto a futura expansão com funcionalidades de monetização.

