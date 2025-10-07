<<<<<<< HEAD

 Complemento RDO [1.8] - Extensão Chrome para Automação de Diário de Obra

 Arquitetura Técnica

Extensão Chrome baseada em Manifest V3 com Service Worker assíncrono, utilizando Chrome Extension APIs para manipulação de DOM e integração com sistema de Diário de Obra.

 Sistema de Processamento

 Processamento de Dados
- Parser de strings temporais para conversão HH:MM → decimal
- Algoritmo de classificação K1/K2/K3 baseado em regras de negócio
- Cálculo automático de horas extras com precisão temporal
- Sistema de cache com Chrome Storage API

 Automação de Interface
- DOM manipulation com querySelector e event listeners
- MutationObserver para detecção de mudanças na página
- Interceptação de formulários e campos de entrada
- Automação de cliques e preenchimento de campos

 Integração com APIs

 Comunicação com Servidor
- Fetch API para requisições HTTP assíncronas
- Verificação de status do servidor central
- Autenticação via token de integração
- Tratamento de erros de conectividade

 Processamento de Arquivos
- PDF-lib para manipulação e mesclagem de PDFs
- SheetJS para geração de planilhas Excel
- Download automático de arquivos
- Compressão e otimização de dados

 Sistema de Armazenamento

 Persistência de Dados
- Chrome Storage API (chrome.storage.sync/local)
- LocalStorage para dados temporários
- SessionStorage para estado da aplicação
- Configurações persistentes do usuário

 Cache e Performance
- Cache de dados com TTL
- Otimização de requisições repetidas
- Debouncing para eventos frequentes
- Lazy loading de componentes

 Interface e Usabilidade

 Manipulação de DOM
- Criação dinâmica de elementos
- Injeção de CSS customizado
- Theming dinâmico com CSS variables
- Responsive design básico

 Automação de Tarefas
- Preenchimento automático de campos
- Cálculo automático de horas
- Formatação inteligente de textos
- Validação de dados em tempo real

 Funcionalidades Específicas

 Cálculo de Horas
- Análise de horários de entrada/saída
- Classificação automática de horas extras
- Cálculo de intervalos e variações
- Geração de relatórios consolidados

 Extração de Dados
- Scraping de dados de relatórios
- Extração de informações de obras
- Consolidação de dados de múltiplas fontes
- Exportação para formatos diversos

 Automação de Interface
- Cards flutuantes com informações
- Atalhos de teclado personalizados
- Scroll suave estilo touch
- Slider de imagens automático

 Segurança e Estabilidade

 Tratamento de Erros
- Try-catch para operações assíncronas
- Fallback para funcionalidades críticas
- Validação de dados de entrada
- Logging de erros para debugging

 Performance
- Otimização de loops e operações
- Minimização de manipulação de DOM
- Cache inteligente de dados
- Lazy loading de recursos


Repositório e Documentação:
https://github.com/diogosflorencio/complemento-rdo

Extensão focada em automação e produtividade.
=======
# Complemento RDO - Extensão para Chrome 🚀

![Versão](https://img.shields.io/badge/versão-Beta%200.8-blue)
![Compatibilidade](https://img.shields.io/badge/Chrome-88%2B-green)
![Licença](https://img.shields.io/badge/licença-MIT-orange)

O Complemento RDO é uma extensão para Google Chrome que simplifica o gerenciamento de Relatórios Diários de Obra (RDO) e Relatórios de Serviços Prestados (RSP). Com automação inteligente, interface personalizável e integração com APIs, ela aumenta a produtividade e precisão no controle de obras. Compatível com Chrome 88+ e app de RDO 5.8.0+.

<p align="center">
  <img src="https://via.placeholder.com/600x300.png?text=Screenshot+do+Complemento+RDO" alt="Screenshot do Complemento RDO" width="300"/>
</p>

## ✨ Funcionalidades Principais

### Cálculo de Horas ⏱️
Soma automática de horas por função, com suporte a extras (K1, K2, K3). Adição rápida via cards. Futuro: K4 (periculosidade).

### Slider de Imagens 🖼️
Visualização fluida de fotos de obras, com cache otimizado e integração à API do Diário de Obra.

### Autoformatação Inteligente 📝
Formata textos automaticamente com API personalizada por usuário e opção de restauração.

### Unificador de Relatórios 📄
Compila PDFs com filtros por data/tipo (RDO, RSP, Orçamentos) e nomes automáticos para SAP.

### Interface Personalizável 🎨
Tema escuro, seletor de cores e cards flutuantes responsivos.

### Atalhos de Teclado ⌨️
Navegação rápida para agilizar o uso.

### Popup de Controle 🎛️
Ativa/desativa funções, salva preferências e mostra o progresso do desenvolvimento.

## 🛠️ Destaques Técnicos

| Tecnologia | Descrição |
|------------|-----------|
| JavaScript Vanilla | Lógica principal da extensão |
| Chrome Extension API | Integração com o navegador |
| MutationObserver | Atualizações em tempo real |
| LocalStorage | Persistência de preferências |
| HTML/CSS | Interface fluida e responsiva |

- **Código Modular**: Estrutura limpa para fácil manutenção.
- **Cache Inteligente**: Otimiza performance e uso de memória.
- **Autenticação Dinâmica**: Tokens para segurança e integração com API.
- **Observers DOM**: Atualizações instantâneas na interface.

Exemplo de Código (Conversão de Horas):
```javascript
function converterTempo(tempoStr) {
  const [horas, minutos] = tempoStr.split(':');
  return parseFloat(horas) + parseFloat(minutos) / 60;
}
```
Converte "08:48" para 8.8, facilitando cálculos.

## 📈 Evolução das Versões

### Beta 0.8 - Visualização Avançada
- Slider de Imagens: Transições suaves, cache de 30 minutos, controle via popup.
- Correções: Sobreposição de imagens e erros de API resolvidos.
- Foco: Performance e usabilidade visual.

### Beta 0.7 - Interatividade
- Novidades: Scroll suave, atalhos, compilação de PDFs.
- Personalização: Seletor de cores e popup redesenhado.
- Melhorias: Estabilidade e uso de memória.

### Beta 0.6 - Cards Otimizados
- Cards de Horas: Atualização automática e salvamento.
- Correções: Tema escuro e extrator de PDFs.
- Foco: Qualidade visual e automação.

### Beta 0.5 - Autoformatação
- Autoformatação: API por usuário com restauração de texto.
- Melhorias: Cálculo de horas extras (K1-K3).
- Problema Conhecido: Falta de salvamento automático em algumas ações.

### Beta 0.4 - Personalização
- Tema: Escolha de cores pelo usuário.
- Popup: Lista de funções atualizada.
- Correções: Filtros de relatórios estabilizados.

### Beta 0.3 - Unificador de PDFs
- Unificador: Filtros por data/tipo, nomes automáticos.
- Interface: Cards flutuantes e tema escuro aprimorado.
- Correções: Bugs de horas e autenticação resolvidos.

### Beta 0.2 - Modularidade
- Interface Modular: Separação de RDO/RSP.
- Horas Extras: Lógicas K1, K2, K3 implementadas.
- Foco: Usabilidade e preparação para futuras funções.

### Beta 0.1 - Fundação
- Base: Cálculo de horas, tema escuro, card flutuante.
- Funções Futuras: Autoformatação, validação de campos, atalhos.

<p align="center">
  <img src="https://via.placeholder.com/600x300.png?text=Slider+de+Imagens+-+Beta+0.8" alt="Slider de Imagens" width="300"/>
</p>

## 🐛 Status Atual

**Correções Recentes:**
- Estabilidade em cards de horas e slider.
- Bugs de formatação, temas e sincronização com API corrigidos.

**Problema Conhecido:**
- Ausência de verificação pós-adição (em desenvolvimento).

> **Aviso**: Use com cuidado, pois cenários variados podem gerar inconsistências. A versão 0.8 prioriza usabilidade, performance e visualização, pavimentando o caminho para validação em tempo real e dashboards.

## 📋 Como Usar

1. Instale no Chrome 88+ via Chrome Web Store (#) (link placeholder).
2. Configure o token de integração com o app de RDO 5.8.0+.
3. Acesse o popup para ativar/desativar funcionalidades.
4. Explore o slider, unificador de PDFs e cálculo de horas!

## 🌟 Próximos Passos

- Validação em tempo real de campos.
- Integração com calendário nacional.
- Dashboard de equipamentos e métricas.
- Suporte a K4 (periculosidade) e temas avançados.

## 📬 Contribua!

Quer ajudar a melhorar o Complemento RDO? Confira o repositório:

👉 **github.com/diogosflorencio/complemento-rdo**

Boa medição! 🛠️
>>>>>>> f7e33eade8739748070ab676dedbe6b382c4ccae
