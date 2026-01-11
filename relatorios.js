// ==================== RELATORIOS.JS - ATUALIZADO ====================

// Função principal para carregar relatórios
function carregarRelatorio(pageId) {
    console.log('📊 Carregando relatório:', pageId);
    
    const container = document.getElementById(pageId);
    if (!container) {
        console.error('Container não encontrado para:', pageId);
        return;
    }
    
    // Mapeamento de páginas de relatório
    const mapeamento = {
        'lista_personagens': {tipo: 'personagens', titulo: '📋 Lista de Personagens'},
        'lista_clientes': {tipo: 'clientes', titulo: '👥 Lista de Clientes'},
        'lista_elenco': {tipo: 'elenco', titulo: '🎬 Lista de Elenco'},
        'lista_motoristas': {tipo: 'motoristas', titulo: '🚗 Lista de Motoristas'},
        'lista_funcionarios': {tipo: 'funcionarios', titulo: '👥 Lista de Funcionários'},
        'lista_casas_festa': {tipo: 'casa_de_festas', titulo: '🏠 Lista de Casas de Festa'},
        'lista_fornecedores': {tipo: 'fornecedores', titulo: '📦 Lista de Fornecedores'},
        'lista_checklists': {tipo: 'checklists', titulo: '✅ Lista de CheckLists'}
    };
    
    const config = mapeamento[pageId];
    if (!config) {
        console.warn('Tipo não mapeado para:', pageId);
        mostrarMensagemErro(container, 'Relatório não configurado');
        return;
    }
    
    // Carrega dados
    const dados = carregarDadosDoLocalStorage(config.tipo);
    
    // Gera HTML
    const html = gerarTabelaRelatorio(config.tipo, dados);
    
    // Atualiza a página
    atualizarPaginaRelatorio(container, config.titulo, html);
    
    console.log(`✅ Relatório carregado: ${dados.length} registros`);
}

// Carrega dados do localStorage
function carregarDadosDoLocalStorage(tipo) {
    try {
        const dados = JSON.parse(localStorage.getItem(tipo) || '[]');
        
        // Ordena por data de cadastro (mais recente primeiro)
        return dados.sort((a, b) => {
            const dataA = a.data_cadastro ? new Date(a.data_cadastro) : new Date(0);
            const dataB = b.data_cadastro ? new Date(b.data_cadastro) : new Date(0);
            return dataB - dataA;
        });
    } catch (error) {
        console.error(`Erro ao carregar ${tipo}:`, error);
        return [];
    }
}

// Gera tabela de relatório
function gerarTabelaRelatorio(tipo, dados) {
    if (dados.length === 0) {
        return `
            <div class="sem-dados">
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 48px; margin-bottom: 20px;">📭</div>
                    <h3 style="margin-bottom: 10px;">Nenhum registro encontrado</h3>
                    <p>Cadastre dados na seção "${getNomeSecaoCadastro(tipo)}"</p>
                    <button onclick="irParaCadastro('${tipo}')" 
                            style="margin-top: 20px; padding: 10px 20px; background: #4361ee; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        📝 Ir para Cadastro
                    </button>
                </div>
            </div>
        `;
    }
    
    // Configurações específicas por tipo
    const configs = {
        'personagens': {
            colunas: ['Foto', 'ID', 'Nome', 'Figurino', 'Tema', 'Quantidade', 'Valor', 'Data Cadastro'],
            renderizar: (item) => ({
                'Foto': item.foto ? 
                    `<img src="${item.foto}" alt="Foto" class="foto-miniatura">` : 
                    '<div class="sem-foto">📷</div>',
                'ID': `<code>${item.id || '--'}</code>`,
                'Nome': item.nome || '--',
                'Figurino': item.figurino || '--',
                'Tema': item.tema || '--',
                'Quantidade': item.quantidade || 1,
                'Valor': formatarMoedaRelatorio(item.valor),
                'Data Cadastro': formatarData(item.data_cadastro)
            })
        },
        'clientes': {
            colunas: ['ID', 'Nome', 'Documento', 'Telefone', 'Email', 'Cidade/UF', 'Data Cadastro'],
            renderizar: (item) => ({
                'ID': `<code>${item.id || '--'}</code>`,
                'Nome': item.nome || '--',
                'Documento': formatarDocumento(item.documento),
                'Telefone': formatarTelefone(item.telefone),
                'Email': item.email || '--',
                'Cidade/UF': `${item.cidade || '--'}/${item.estado || '--'}`,
                'Data Cadastro': formatarData(item.data_cadastro)
            })
        },
        // Adicione configurações para outros tipos...
    };
    
    const config = configs[tipo] || {
        colunas: ['ID', 'Nome', 'Data Cadastro'],
        renderizar: (item) => ({
            'ID': `<code>${item.id || '--'}</code>`,
            'Nome': item.nome || item.nome_personagens || item.nomecasadefestas || '--',
            'Data Cadastro': formatarData(item.data_cadastro)
        })
    };
    
    let html = `
        <div class="relatorio-container">
            <div class="relatorio-header">
                <div class="relatorio-info">
                    <span class="total-registros">📊 Total: ${dados.length} registro${dados.length !== 1 ? 's' : ''}</span>
                    <span class="ultima-atualizacao">🕒 Atualizado: ${new Date().toLocaleTimeString('pt-BR')}</span>
                </div>
                <div class="relatorio-acoes">
                    <button onclick="exportarRelatorio('${tipo}', 'csv')" class="btn-exportar">
                        📥 Exportar CSV
                    </button>
                    <button onclick="imprimirRelatorio('${tipo}')" class="btn-imprimir">
                        🖨️ Imprimir
                    </button>
                </div>
            </div>
            
            <div class="table-container">
                <table class="tabela-relatorio">
                    <thead>
                        <tr>
    `;
    
    // Cabeçalhos
    config.colunas.forEach(coluna => {
        html += `<th>${coluna}</th>`;
    });
    
    html += `
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    // Linhas
    dados.forEach((item, index) => {
        html += '<tr>';
        
        const valores = config.renderizar(item);
        config.colunas.forEach(coluna => {
            html += `<td>${valores[coluna] || '--'}</td>`;
        });
        
        html += '</tr>';
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    return html;
}

// Atualiza a página do relatório
function atualizarPaginaRelatorio(container, titulo, conteudo) {
    // Remove conteúdo anterior (exceto o título se existir)
    const card = container.querySelector('.card');
    
    if (card) {
        // Mantém apenas o título
        const tituloAtual = card.querySelector('h2');
        if (tituloAtual) {
            tituloAtual.textContent = titulo;
        } else {
            card.innerHTML = `<h2>${titulo}</h2>`;
        }
        
        // Remove tabelas anteriores
        const elementosAntigos = card.querySelectorAll('.relatorio-container, .sem-dados, table');
        elementosAntigos.forEach(el => el.remove());
        
        // Adiciona novo conteúdo
        card.innerHTML += conteudo;
    } else {
        container.innerHTML = `
            <div class="card">
                <h2>${titulo}</h2>
                ${conteudo}
            </div>
        `;
    }
}

// ==================== FUNÇÕES AUXILIARES ====================
function formatarData(dataString) {
    if (!dataString) return '--';
    try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR').substring(0, 5);
    } catch {
        return '--';
    }
}

function formatarMoedaRelatorio(valor) {
    if (!valor) return 'R$ 0,00';
    try {
        // Tenta converter string para número
        let numero;
        if (typeof valor === 'string') {
            const limpo = valor.replace(/[^\d,.-]/g, '').replace(',', '.');
            numero = parseFloat(limpo);
        } else {
            numero = valor;
        }
        
        if (isNaN(numero)) return valor;
        
        return numero.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    } catch {
        return valor;
    }
}

function formatarDocumento(doc) {
    if (!doc) return '--';
    // Se for CPF
    if (doc.length === 11 || doc.replace(/\D/g, '').length === 11) {
        const limpo = doc.replace(/\D/g, '');
        return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    // Se for CNPJ
    if (doc.length === 14 || doc.replace(/\D/g, '').length === 14) {
        const limpo = doc.replace(/\D/g, '');
        return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
}

function formatarTelefone(tel) {
    if (!tel) return '--';
    const limpo = tel.replace(/\D/g, '');
    if (limpo.length === 11) {
        return limpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (limpo.length === 10) {
        return limpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return tel;
}

function getNomeSecaoCadastro(tipo) {
    const nomes = {
        'clientes': 'Clientes',
        'casa_de_festas': 'Casa de Festas',
        'elenco': 'Elenco',
        'personagens': 'Personagens',
        'motoristas': 'Motoristas',
        'fornecedores': 'Fornecedores',
        'funcionarios': 'Funcionários',
        'checklists': 'Check List'
    };
    return nomes[tipo] || 'Cadastro';
}

function irParaCadastro(tipo) {
    const paginas = {
        'clientes': 'clientes',
        'casa_de_festas': 'casa_de_festas',
        'elenco': 'elenco',
        'personagens': 'personagens',
        'motoristas': 'motoristas',
        'fornecedores': 'fornecedores',
        'funcionarios': 'funcionarios',
        'checklists': 'criar_checklist'
    };
    
    const pagina = paginas[tipo];
    if (pagina && window.showPage) {
        window.showPage(pagina);
    }
}

// ==================== EXPORTAÇÃO ====================
function exportarRelatorio(tipo, formato) {
    const dados = JSON.parse(localStorage.getItem(tipo) || '[]');
    
    if (dados.length === 0) {
        alert('Não há dados para exportar');
        return;
    }
    
    if (formato === 'csv') {
        exportarParaCSV(tipo, dados);
    }
}

function exportarParaCSV(tipo, dados) {
    // Cria cabeçalho CSV simples
    let csv = 'ID,Nome,Data Cadastro\n';
    
    dados.forEach(item => {
        const nome = item.nome || item.nome_personagens || item.nomecasadefestas || '';
        const data = item.data_cadastro ? new Date(item.data_cadastro).toLocaleDateString('pt-BR') : '';
        csv += `${item.id || ''},"${nome}","${data}"\n`;
    });
    
    // Cria e baixa arquivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${tipo}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function imprimirRelatorio(tipo) {
    window.print();
}

// ==================== INICIALIZAÇÃO ====================
// Monitora quando uma página de relatório é aberta
document.addEventListener('DOMContentLoaded', function() {
    // Configura para carregar relatório quando a página for mostrada
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const elemento = mutation.target;
                if (elemento.classList.contains('page') && elemento.classList.contains('active')) {
                    const pageId = elemento.id;
                    if (pageId && pageId.startsWith('lista_')) {
                        // Pequeno delay para garantir que o DOM está pronto
                        setTimeout(() => carregarRelatorio(pageId), 100);
                    }
                }
            }
        });
    });
    
    // Observa todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        observer.observe(page, { attributes: true });
    });
    
    // Também carrega relatório se já estiver em uma página de lista
    const paginaAtual = localStorage.getItem('currentPage');
    if (paginaAtual && paginaAtual.startsWith('lista_')) {
        setTimeout(() => carregarRelatorio(paginaAtual), 500);
    }
});