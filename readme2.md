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
