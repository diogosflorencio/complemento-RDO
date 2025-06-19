## Versão [Beta 0.9] - Novo Extrator de Dados e Unificação de Relatórios

### Extrator de Dados e Relatórios 📄
- Novo sistema de extração de dados dos relatórios, exportando atividades diretamente para **XLSX**
- Extração detalhada de todas as atividades e horas dos relatórios, com filtragem por período, status e obras específicas
- Interface de filtro totalmente redesenhada, com seleção de datas, ordem, tipos de relatório e exclusão de obras
- Exportação de dados e PDFs agora integradas em um único painel flutuante, acessível em qualquer obra
- Possibilidade de extrair apenas relatórios **100% aprovados**

### Unificação e Otimização de PDFs 🔗
- Mesclagem automática de todos os PDFs dos relatórios de uma obra em um único arquivo, com nomeação inteligente (**RDO/RSP**)
- Novo método de fetch paralelo para buscar relatórios, tornando o processo muito mais rápido e eficiente
- Suporte a diferentes tipos de relatórios: **Diário de Obra, Semanal de Produção, Orçamentos**, entre outros
- Download otimizado e status detalhado do progresso da extração

### Interface e Usabilidade 🎨
- Card de filtro flutuante com modo duplo: exportação de dados (**XLSX**) ou **PDFs**
- Explicação interativa sobre o funcionamento do extrator, acessível diretamente no painel
- Inputs para exclusão de obras por sigla e extração de obras específicas por ID
- Feedback visual de status e progresso durante todo o processo de extração

### Melhorias Técnicas 🔧
- Refatoração completa dos scripts de extração, separando lógica de dados e interface
- Uso de variáveis globais e armazenamento local para maior compatibilidade entre empresas
- Gerenciamento eficiente de estados e listeners para ativação/desativação do extrator
- Preparação para futura descontinuação do extrator antigo, com aviso integrado na interface

### Correções de Bugs 🐛
- Ajustes na filtragem de obras e relatórios para evitar duplicidades e erros de seleção
- Melhor tratamento de erros de API e feedback ao usuário
- Correção de problemas de interface ao alternar entre modos de extração

### Compatibilidade
- Chrome 88+
- Versão 5.8.0+ do app de RDO
- Necessário token de integração ativo

> **Observação:**  
> A versão 0.9 inaugura um novo padrão de extração e compilação de dados e PDFs, tornando o processo mais rápido, intuitivo e flexível. O usuário agora tem controle total sobre o que extrair, com filtros avançados e interface unificada, além de performance significativamente superior.

# Versão [Beta 0.8] - Slider de Imagens das Obras

## Slider de Imagens 🖼️
- Visualização dinâmica das últimas fotos das obras em andamento
- Transição suave com efeito fade entre as imagens
- Sistema inteligente de cache para otimização de carregamento
- Preservação da imagem original da obra
- Ativação/desativação da funcionalidade via popup

## Integração com API 🔄
- Sincronização automática com a API do Diário de Obra
- Cache inteligente com validade de 30 minutos
- Pré-carregamento de imagens para transição suave
- Tratamento de erros e fallback para imagem padrão

## Interface e Usabilidade 🎨
- Interação por hover para visualização das imagens
- Delay inteligente para evitar ativações indesejadas
- Transições suaves entre as imagens
- Preservação da tag "Em andamento"
- Interface responsiva e adaptativa

## Melhorias Técnicas 🔧
- Sistema de cache otimizado para melhor performance
- Gerenciamento eficiente de memória
- Controle preciso de estados e transições
- Verificações inteligentes de URL para otimização

## Correções de Bugs 🐛
- Correção de sobreposição de imagens durante transições
- Ajustes na preservação da imagem original
- Melhorias na estabilidade do slider
- Otimização do tratamento de erros da API

## Personalização ⚙️
- Controle de ativação/desativação no popup
- Estado persistente das preferências do usuário
- Integração com o sistema de tema personalizado
- Configurações individuais por usuário

## Compatibilidade
- Chrome 88+
- Versão 5.8.0+ do app de RDO
- Necessário token de integração ativo

**Observação:** A versão 0.8 traz uma experiência mais rica na visualização de obras, permitindo aos usuários acompanhar o progresso visual diretamente na interface principal, com foco em performance e usabilidade.

---

# Versão [Beta 0.7] - Interatividade e Personalização

## Novas Funcionalidades ⭐
- Sistema de scroll suave estilo touch para melhor navegação
- Teclas de atalho para navegação rápida no sistema
- Sistema de extração e compilação de PDFs por obra
- Interface aprimorada do popup com controles individuais

## Personalização 🎨
- Seletor de cores personalizado para tema do aplicativo
- Opções predefinidas de cores para rápida customização
- Persistência das preferências de tema do usuário
- Novo sistema de ativação/desativação de funcionalidades

## Card de Horas e Autoformatação 📊
- Aprimoramento na exibição de horas por função
- Melhorias na formatação automática de textos
- Campo dedicado para chave da API do Gemini
- Salvamento automático das configurações

## Melhorias Técnicas 🔧
- Reestruturação completa do código para melhor performance
- Sistema de cache para otimização de recursos
- Melhor gerenciamento de estado das funcionalidades
- Novo sistema de feedback visual para ações

## Correções de Bugs 🐛
- Correções no tema escuro (ainda em desenvolvimento)
- Ajustes na consistência visual dos elementos
- Melhorias na estabilidade geral
- Otimização do uso de memória

## Nova Interface de Controle 🎛️
- Popup redesenhado com nova organização
- Lista detalhada de funcionalidades
- Controles individuais para cada feature
- Disclaimer de responsabilidade

## Compatibilidade
- Chrome 88+
- Versão 5.8.0+ do app de RDO

**Observação:** A versão 0.7 representa um salto significativo em termos de personalização e controle do usuário, com novas funcionalidades focadas em produtividade e experiência do usuário.

---

# Versão [Beta 0.6] - Atualização de Cards e Melhorias

## Card de Horas 🕒
- Atualização automática ao adicionar/remover colaboradores
- Correção na cor tema do card
- Salvamento automático após adição de horas no campo atividades

## Interface e Usabilidade 🎨
- Botão de auto formatação restrito aos campos de comentário (estava antes, erroneamente, em todos os campos do tipo tbody tr)
- Aprimoramento do tema escuro (em desenvolvimento. Favor não utilizar)
- Para melhor uso da feature na versão 0.5, onde as imagens ficaram maiores, qualidade máxima nas evidências anexadas

## Correções de Bugs 🐛
- Correção na cor tema do extrator de PDFs
- Ajustes na atualização dinâmica do card de HH
- Melhorias na consistência visual

## Compatibilidade
- Chrome 88+
- Versão 5.8.0 do app de RDO

**Observação:** A versão 0.6 traz melhorias significativas na experiência do usuário, com foco em automação e qualidade visual.

---

# Versão [Beta 0.5] - Autoformatação e Estabilidade

## Autoformatação Inteligente 📝
- Novo sistema de auto formatação de textos com API individual por usuário
- Possibilidade de restaurar texto anterior para maior consistência e segurança

## Interface e Usabilidade 🎨
- Ajuste dinâmico do tamanho das evidências nos relatórios (imagens maiores)
- Card de horas com wrap aprimorado para melhor visualização (mantendo estado durante o uso)
- Cor padrão inicial do cabeçalho otimizada

## Melhorias Técnicas 🔧
- Correção no cálculo de horas considerando período de intervalo e suas variações individuais
- Otimização do observer para prevenir problemas de reload do complemento
- Aprimoramento no cálculo de horas extras (K1, K2, K3)

## Correções de Bugs 🐛
- Correção no tratamento de intervalos vazios
- Ajustes na lógica de categorização de horas extras
- Estabilização do observer após reload da extensão

## Problemas Conhecidos ⚠️
- Implementar a atualização das informações do card também para quando um colaborador for adicionado ou removido
- Necessidade de implementação de salvamento automático após adição de horas no campo de atividade

## Compatibilidade
- Chrome 88+
- Versão 5.8.0 do app de RDO

**Observação:** A versão 0.5 marca um avanço significativo na autoformatação e estabilidade, com foco especial no tratamento inteligente de dados e melhor experiência do usuário.

---

# Versão [Beta 0.4] - Novas Funcionalidades e Melhorias

## Personalização a gosto 📄
- Escolha da cor do tema pelo usuário, permitindo personalizar a aparência da extensão e do site conforme preferências.

## Interface e Usabilidade 🎨
- Tema escuro em reformulação para maior consistência visual.
- Novos itens nos checkboxes do popup, oferecendo mais flexibilidade de configurações.

## Melhorias no Popup 🔍
- Lista de funções futuras e concluídas atualizada, com visão clara do progresso.

## Melhorias Tecnicas 🔧
- Filtro de tipo de relatório no Unificador de Relatórios corrigido para melhor precisão.
- Melhorias no desempenho e otimização de recursos.

## Correcoes de Bugs 🐛
- Correção no comportamento do filtro de tipo de relatório.
- Ajustes no popup para maior estabilidade e consistência.

## Problemas Conhecidos ⚠️
- Ausência de verificação pós adição ainda não resolvida (um controle de tempo será adicionado para reduzir erros).
- Cores do tema escuro despadronizadas, sendo necessário retroceder em alguns pontos antes de avançar.

## Compatibilidade
- Chrome 88+
- Versão 5.8.0 do app de RDO

**Observação:** A versão 0.4 traz melhorias importantes na interface e funcionalidades, incluindo a personalização de cor do tema e correção no filtro de relatórios, com foco em maior flexibilidade e precisão.

---

# Versão [Beta 0.3] - Novas Funcionalidades e Melhorias

## Unificador de Relatórios 📄
- Novo card flutuante para unificação de PDFs
- Sistema de filtro por data (início e fim)
- Filtro por tipo de relatório (RDO, RSP e Orçamentos)
- Ordenação personalizada (Do fim ao início / Do início ao fim)
- Interface intuitiva e recolhível
- Autenticação automática via token de integração
- Implementação de filtro por tipo de relatório, para melhor organização dos PDFs extraídos
- Nomenclatura automática dos arquivos de acordo com nome da obra e seguindo necessidade de anexação ao SAP

## Interface e Usabilidade 🎨
- Aprimoramento do tema escuro
- Expansão otimizada dos campos de comentário dos RSPs
- Interface mais limpa e moderna
- Cards recolhíveis com estado persistente

## Melhorias no Popup 🔍
- Reorganização das funções futuras com separação clara entre:
  - Funcionalidades já implementadas
  - Recursos em desenvolvimento
  - Próximas implementações planejadas
- Interface mais intuitiva e organizada
- Melhor visualização do progresso do desenvolvimento
- Reorganização modular das funções no popup

## Melhorias Técnicas 🔧
- Implementação de observers específicos
- Sistema de flags para controle de estados
- Melhor gerenciamento de memória
- Autenticação dinâmica via token
- Código mais modular e manutenível
- Filtros otimizados na API

## Correcoes de Bugs 🐛
- Ajustes no comportamento dos cards flutuantes
- Melhor gestão de estados dos componentes
- Tratamento de erros de autenticação
- Otimização dos observers
- Correção na filtragem de relatórios
- Já não há mais inconsistências na adição automática de horas
- A adição incorreta de siglas de função foi extinguida
- Omissão ocasional de funções também
- Adição indevida do campo "em andamento" foi retirada
- Travamento do campo "atividades" após adição sanado

## Problemas Conhecidos ⚠️
- Ausência de verificação pós adição

## Compatibilidade
- Chrome 88+
- Versão 5.8.0 do app de RDO

**Observação:** Está versão apresenta funcionalidades consistentes e úteis para mais pessoas, sendo assim, será disponibilizada publicamente.

---

# Versão [Beta 0.2] - Novas Funcionalidades e Melhorias

## Interface Modular 🎯
- Nova interface organizada em módulos distintos
- Separação clara entre funções RDO e RSP
- Design mais intuitivo e responsivo

## Sistema de Horas Extras ⏱️
- Implementação de lógicas K1 (após horário normal e outras frentes)
- K2 (após 2h do K1 e fins de semana)
- K3 (máximo 7h, após 22h)
- Adição automática de horas no campo atividade via botão "adicionar" no card
- K4 (periculosidade) e K2 (feriados) previstos para próxima atualização

## Atalhos de Teclado ⌨️
- Implementação inicial de atalhos
- Navegação mais rápida entre funcionalidades

## Personalização 🎨
- Correções no tema escuro
- Preparação para sistema de temas personalizáveis
- Sistema de variáveis globais para cores

## Melhorias Técnicas
- Código refatorado para maior eficiência
- Melhor tratamento de erros
- Sistema modular para fácil manutenção
- Preparação para implementações futuras

## Funções Futuras Atualizadas
- Sistema inteligente de formatação automática
- Validação em tempo real de campos
- Integração com calendário nacional
- Sistema de compilação de PDFs
- Dashboard de equipamentos
- Análise avançada de métricas

## Compatibilidade
- Chrome 88+
- Versão 5.8.0 do app de RDO

**Observação:** Está extensão deve ser utilizada com cautela. As informações oferecidas por elas, apesar de toda verificação e empenho pra torná-las confiáveis e úteis, podem ser inconsistentes dada as incontáveis possibilidades/cenários que há em um período de medição. Sobre está versão, ela representa um avanço significativo na usabilidade e organização da extensão, preparando o terreno para funcionalidades mais avançadas no futuro.

---

# Versão [Beta 0.1] - Funcionalidades Principais

## 1. Análise de Horas Automatico ⏱️
- Realiza a soma automática de horas por função em RDOs de HH e identifica horas extras em fins de semana (K2).
- No futuro, serão implementadas lógicas adicionais para a conversão de horas, utilizando parâmetros obtidos dos relatórios, de maneira semelhante ao que já ocorre com a classificação K2. A classificação K1 será aplicada às horas trabalhadas que excedem 8,8 horas normais (HN), limitadas a um máximo de 2 horas extras. Por exemplo, se o trabalho for iniciado às 06:30 e o funcionário continuar até além das 16:18, as horas entre 16:18 e 18:18 serão contabilizadas como K1, enquanto o restante será considerado K2. Além disso, a classificação K3 será aplicada às horas trabalhadas entre 22:00 e 05:00, considerando todas as horas nesse intervalo como K3, que representam horas extras noturnas. Neste contexto, as horas normais serão limitadas a 8,8 horas (HN) e as regras descritas anteriormente serão aplicadas, alterando-se apenas em casos de fins de semana e feriados (informação que tentarei obter através de uma biblioteca externa), onde todo o período de trabalho será classificado como K2, além de K3 para horas noturnas adicionais.
- Exemplo de implementação: A função que converte uma string de tempo no formato "hh:mm" em um valor decimal pode ser representada assim:

```javascript
function converterTempo(tempoStr) {
    const [horas, minutos] = tempoStr.split(':');
    return parseFloat(horas) + parseFloat(minutos) / 60;
}
```

Por exemplo, se a entrada for "08:48", a função retornará 8.8, facilitando a contabilização de horas.

## 2. Interface Flutuante 🖥️
- Apresenta um card recolhível que mantém o estado mesmo após recarregamentos. (está com um bug)
- Inclui um botão de cópia rápida para relatórios.
- Exemplo: Um container pode ser criado com uma classe específica e posicionado fixamente no canto inferior da tela, permitindo que os usuários copiem rapidamente dados do relatório:

```javascript
const containerDados = document.createElement('div');
containerDados.className = 'cartao-funcao';
containerDados.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 99999;
`;
```

Isso garante que o acesso às funcionalidades seja sempre conveniente.

## 3. Tema Escuro 🌙
- Permite a alteração dinâmica das cores da plataforma, proporcionando uma experiência visual mais agradável durante o uso noturno.
- A personalização de elementos DOM específicos é feita através de uma função que altera as cores de cabeçalhos e outros elementos:

```javascript
function aplicarCores(cabecalhosAtivados) {
    const headings = document.querySelectorAll('h1, h2, h3');
    headings.forEach(heading => {
        heading.style.color = cabecalhosAtivados ? "#d8d8d8" : '';
    });
}
```

Por exemplo, ao ativar o tema escuro, os cabeçalhos se tornam cinza claro, reduzindo a fadiga ocular.

## Funções Futuras da Extensão

1. **Cor Principal 🎨**  
   Implementação de uma funcionalidade que permitirá trocar a cor principal dos cabeçalhos. A funcionalidade já existe, mas ainda não está conectada às funções do popup.

2. **Auto formatação de Texto ✍️**  
   Desenvolver uma função que possibilite a auto formatação das descrições. Essa funcionalidade tende a ser desafiadora e pode não ser totalmente viável ou funcional.

3. **Validador de Campos ⚠️**  
   Implementação de um sistema que avise se algum campo essencial estiver vazio. Essa função indicará de forma clara quando um campo que deve ser preenchido obrigatoriamente não estiver completo.

4. **Teclas de Atalho ⌨️**  
   Introdução de atalhos de teclado, como Alt + H para acessar a página inicial, por exemplo. Isso permitirá que os usuários naveguem pelo site e adicionem relatórios ou itens nos relatórios de forma mais eficiente.

## Recursos Técnicos
- Utiliza observadores DOM para atualizações em tempo real, permitindo que as alterações na interface sejam refletidas instantaneamente.
- Implementa um sistema de cache para armazenar as preferências do usuário e manipula dinamicamente os estilos CSS.
- Exemplo: Um observador pode ser configurado para monitorar mudanças no DOM e, ao detectar novos relatórios, chama uma função para atualizar automaticamente os dados:

```javascript
const observer = new MutationObserver(() => {
    if (verificarRelatorio()) {
        atualizarDados();
    }
});
```

## Tecnologias Utilizadas
- JavaScript Vanilla
- Chrome Extension API
- MutationObserver
- LocalStorage
- HTML e CSS

## Compatibilidade
- Chrome 88+
- Versão 5.7.3 do app de RDO.

**Boa mediação!**
```
