// ==================== scriptindex.js - SISTEMA CORRIGIDO ====================
// Função para gerar IDs automáticos
function gerarID(formulario) {
  const prefixos = {
    'clientes': 'CLI',
    'casa_de_festas': 'CF',
    'elenco': 'EL',
    'personagens': 'PER',
    'motoristas': 'MOT',
    'fornecedores': 'FOR',
    'funcionarios': 'FUNC',
    'usuarios': 'USR',
    'eventos': 'EV',
    'manutencoes': 'MAN',
    'checklists': 'CHK',
    'escalas': 'ESC'
  };
  
  const prefixo = prefixos[formulario] || 'ID';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${prefixo}-${timestamp}-${random}`;
}

// Função para inicializar IDs ao abrir formulários
function inicializarID(formulario) {
  const idField = document.getElementById(`ID_${formulario}`);
  if (idField) {
    idField.value = gerarID(formulario);
  }
}

// Modifique a função showPage para inicializar IDs
function showPage(pageId) {
  // Código existente...
  
  // Inicializar ID quando abrir um formulário
  const formularios = ['clientes', 'casa_de_festas', 'elenco', 'personagens', 'motoristas', 
                      'fornecedores', 'funcionarios', 'usuarios_sistema'];
  
  if (formularios.includes(pageId)) {
    setTimeout(() => {
      inicializarID(pageId.replace('sistema', '').replace('_de_', '_'));
    }, 100);
  }
}
// Função para salvar usuário
function salvarUsuario() {
  const id = document.getElementById('ID_usuario').value || gerarID('usuarios');
  const cpf = document.getElementById('cpf_usuario').value;
  const nome = document.getElementById('nome_usuario').value;
  const login = document.getElementById('login_usuario').value;
  const senha = document.getElementById('senha_usuario').value;
  const email = document.getElementById('email_usuario').value;
  const telefone = document.getElementById('telefone_usuario').value;
  const cargo = document.getElementById('cargo_usuario').value;
  const dataAdmissao = document.getElementById('data_admissao').value || new Date().toISOString().split('T')[0];
  
  if (!cpf || !nome || !login || !senha) {
    alert('Por favor, preencha todos os campos obrigatórios (*)');
    return;
  }
  
  // Validar CPF
  if (!validarCPF(cpf)) {
    alert('CPF inválido!');
    return;
  }
  
  // Criar objeto do usuário
  const usuario = {
    id: id,
    cpf: cpf,
    nome: nome,
    login: login,
    senha: senha, // Em produção, deve ser criptografada
    email: email,
    telefone: telefone,
    cargo: cargo,
    dataAdmissao: dataAdmissao,
    status: 'ativo',
    dataCadastro: new Date().toISOString(),
    permissoes: [] // Permissões serão adicionadas depois
  };
  
  // Obter usuários existentes
  let usuarios = JSON.parse(localStorage.getItem('usuarios_sistema') || '[]');
  
  // Verificar se login já existe
  if (usuarios.some(u => u.login === login)) {
    alert('Login já existe! Escolha outro login.');
    return;
  }
  
  // Adicionar novo usuário
  usuarios.push(usuario);
  
  // Salvar no localStorage
  localStorage.setItem('usuarios_sistema', JSON.stringify(usuarios));
  
  // Atualizar lista
  atualizarListaUsuarios();
  
  // Limpar formulário
  limparFormularioUsuario();
  
  // Gerar novo ID para próximo cadastro
  document.getElementById('ID_usuario').value = gerarID('usuarios');
  
  alert('Usuário cadastrado com sucesso!');
}

// Atualizar lista de usuários
function atualizarListaUsuarios() {
  const usuarios = JSON.parse(localStorage.getItem('usuarios_sistema') || '[]');
  const tabela = document.getElementById('listaUsuarios');
  
  let html = '';
  
  usuarios.forEach(usuario => {
    const statusClass = usuario.status === 'ativo' ? 'status-ativo' : 'status-inativo';
    const statusText = usuario.status === 'ativo' ? 'Ativo' : 'Inativo';
    
    html += `
      <tr>
        <td>${usuario.id}</td>
        <td><strong>${usuario.nome}</strong></td>
        <td>${usuario.login}</td>
        <td>${usuario.cargo || 'Não definido'}</td>
        <td>
          <span class="${statusClass}">${statusText}</span>
        </td>
        <td>
          <button class="btn small" onclick="editarUsuario('${usuario.id}')">
            ✏️ Editar
          </button>
          <button class="btn small ${usuario.status === 'ativo' ? 'danger' : 'success'}" 
                  onclick="toggleStatusUsuario('${usuario.id}')">
            ${usuario.status === 'ativo' ? '❌ Desativar' : '✅ Ativar'}
          </button>
        </td>
      </tr>
    `;
  });
  
  tabela.innerHTML = html || '<tr><td colspan="6" style="text-align:center;">Nenhum usuário cadastrado</td></tr>';
}

// Filtrar usuários na busca
function filtrarUsuarios() {
  const busca = document.getElementById('buscarUsuario').value.toLowerCase();
  const usuarios = JSON.parse(localStorage.getItem('usuarios_sistema') || '[]');
  const tabela = document.getElementById('listaUsuarios');
  
  let html = '';
  
  usuarios.filter(usuario => 
    usuario.nome.toLowerCase().includes(busca) || 
    usuario.login.toLowerCase().includes(busca)
  ).forEach(usuario => {
    const statusClass = usuario.status === 'ativo' ? 'status-ativo' : 'status-inativo';
    const statusText = usuario.status === 'ativo' ? 'Ativo' : 'Inativo';
    
    html += `
      <tr>
        <td>${usuario.id}</td>
        <td><strong>${usuario.nome}</strong></td>
        <td>${usuario.login}</td>
        <td>${usuario.cargo || 'Não definido'}</td>
        <td>
          <span class="${statusClass}">${statusText}</span>
        </td>
        <td>
          <button class="btn small" onclick="editarUsuario('${usuario.id}')">
            ✏️ Editar
          </button>
          <button class="btn small ${usuario.status === 'ativo' ? 'danger' : 'success'}" 
                  onclick="toggleStatusUsuario('${usuario.id}')">
            ${usuario.status === 'ativo' ? '❌ Desativar' : '✅ Ativar'}
          </button>
        </td>
      </tr>
    `;
  });
  
  tabela.innerHTML = html || '<tr><td colspan="6" style="text-align:center;">Nenhum usuário encontrado</td></tr>';
}

// Limpar formulário de usuário
function limparFormularioUsuario() {
  document.getElementById('formUsuario').reset();
  document.getElementById('ID_usuario').value = gerarID('usuarios');
}

// Mostrar/ocultar senha
function toggleSenha() {
  const senhaInput = document.getElementById('senha_usuario');
  const tipoAtual = senhaInput.type;
  
  if (tipoAtual === 'password') {
    senhaInput.type = 'text';
  } else {
    senhaInput.type = 'password';
  }
}

// Para outros formulários com senha
function toggleSenhaGeral(inputId) {
  const senhaInput = document.getElementById(inputId);
  const tipoAtual = senhaInput.type;
  
  if (tipoAtual === 'password') {
    senhaInput.type = 'text';
  } else {
    senhaInput.type = 'password';
  }
}
// Buscar dados por CPF/CNPJ
async function buscarCPFCNPJ(documento, tipo) {
  if (!documento || documento.length < 11) return;
  
  try {
    // Limpar formatação
    const docLimpo = documento.replace(/\D/g, '');
    // ==================== CONFIGURAÇÃO DE APIs ====================
const API_CONFIG = {
  brasilapi: {
    baseUrl: 'https://brasilapi.com.br/api',
    endpoints: {
      cnpj: '/cnpj/v1/{cnpj}'
    }
  },
  // Para CPF você precisará de APIs pagas
  receitaFederal: {
    // Esta é uma API de exemplo - você precisará contratar um serviço
    baseUrl: 'https://api.servicoautorizado.com.br',
    token: 'https://apigateway.conectagov.estaleiro.serpro.gov.br/oauth2/jwt-token' // Obtenha em serviços como:
    // - https://www.serpro.gov.br
    // - https://www.receitaws.com.br (tem limitações)
    // - https://www.cpfcnpj.com.br
  }
};

// ==================== FUNÇÃO DE BUSCA REAL COM APIs ====================
async function buscarDocumentoReal(documento, tipo) {
  const docLimpo = documento.replace(/\D/g, '');
  
  if (tipo === 'cnpj') {
    return await buscarCNPJBrasilAPI(docLimpo);
  } else if (tipo === 'cpf') {
    return await buscarCPFComAPI(docLimpo);
  }
  
  return null;
}

// ==================== BUSCA DE CNPJ COM BRASILAPI (GRATUITO) ====================
async function buscarCNPJBrasilAPI(cnpj) {
  try {
    if (cnpj.length !== 14) return null;
    
    const response = await fetch(
      `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      
      // Formatando os dados retornados
      return {
        nome: data.razao_social || data.nome_fantasia,
        nomeFantasia: data.nome_fantasia,
        cnpj: data.cnpj,
        situacao: data.descricao_situacao_cadastral,
        abertura: data.data_inicio_atividade,
        naturezaJuridica: data.natureza_juridica,
        cnae: data.cnae_fiscal_descricao,
        endereco: {
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cep: data.cep,
          municipio: data.municipio,
          uf: data.uf
        },
        contato: {
          telefone: data.ddd_telefone_1,
          email: data.email
        },
        capitalSocial: data.capital_social,
        fonte: 'brasilapi'
      };
    } else {
      console.error('Erro na busca do CNPJ:', await response.text());
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar CNPJ:', error);
    return null;
  }
}

// ==================== BUSCA DE CPF COM API PAGA ====================
async function buscarCPFComAPI(cpf) {
  try {
    if (cpf.length !== 11) return null;
    
    // EXEMPLO 1: Usando ReceitaWS (limitado - apenas validação)
    // const receitaws = await buscarCPFReceitaWS(cpf);
    // if (receitaws) return receitaws;
    
    // EXEMPLO 2: Usando CPF-CNPJ.com.br (pago)
    // return await buscarCPFCPFCNPJCom(cpf);
    
    // EXEMPLO 3: Implementação genérica para seu provedor
    return await buscarCPFProvedorCustomizado(cpf);
    
  } catch (error) {
    console.error('Erro ao buscar CPF:', error);
    return null;
  }
}

// ==================== EXEMPLO: RECEITAWS (APENAS VALIDAÇÃO) ====================
async function buscarCPFReceitaWS(cpf) {
  try {
    // ATENÇÃO: ReceitaWS tem limites rigorosos e apenas valida CPF
    const response = await fetch(`https://receitaws.com.br/v1/cpf/${cpf}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'OK' && data.nome) {
        return {
          nome: data.nome,
          cpf: data.cpf,
          situacao: 'VALIDADO',
          fonte: 'receitaws',
          // Nota: ReceitaWS não retorna data de nascimento
        };
      }
    }
  } catch (error) {
    console.warn('ReceitaWS não disponível:', error);
  }
  return null;
}

// ==================== EXEMPLO: PROVEDOR PAGO CUSTOMIZADO ====================
async function buscarCPFProvedorCustomizado(cpf) {
  // Configure seu provedor aqui
  const provedorConfig = {
    url: 'https://api.seuprovedor.com.br/consulta/cpf',
    token: 'https://apigateway.conectagov.estaleiro.serpro.gov.br/oauth2/jwt-token',
    headers: {
      'Authorization': 'Bearer SEU_TOKEN_API_AQUI',
      'Content-Type': 'swagger.json',
      'Accept': 'swagger.json'
    }
  };
  
  try {
    const response = await fetch(provedorConfig.url, {
      method: 'POST', // ou GET dependendo do provedor
      headers: provedorConfig.headers,
      body: JSON.stringify({
        cpf: cpf,
        token: provedorConfig.token
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Ajuste este mapeamento conforme a resposta da sua API
      return {
        nome: data.nome || data.nome_completo,
        nascimento: data.data_nascimento || data.nascimento,
        cpf: data.cpf,
        situacao: data.situacao_cadastral || data.status,
        mae: data.nome_mae,
        pai: data.nome_pai,
        endereco: {
          logradouro: data.logradouro,
          numero: data.numero,
          bairro: data.bairro,
          cidade: data.cidade,
          uf: data.uf,
          cep: data.cep
        },
        fonte: 'provedor_customizado'
      };
    }
  } catch (error) {
    console.error('Erro no provedor customizado:', error);
  }
  
  return null;
}

// ==================== FUNÇÃO UNIFICADA DE BUSCA ====================
async function buscarDocumentoCompleto(documento) {
  const docLimpo = documento.replace(/\D/g, '');
  const tipo = docLimpo.length === 11 ? 'cpf' : 'cnpj';
  
  // Primeiro, tentar buscar na API real
  const dadosAPI = await buscarDocumentoReal(documento, tipo);
  
  if (dadosAPI) {
    return dadosAPI;
  }
  
  // Se a API falhar, usar dados mockados para demonstração
  console.warn('API não disponível, usando dados de demonstração');
  return buscarDadosMockados(docLimpo, tipo);
}

// ==================== DADOS MOCKADOS PARA DEMONSTRAÇÃO ====================
function buscarDadosMockados(docLimpo, tipo) {
  const mockData = {
    cpf: {
      '12345678909': {
        nome: 'João Silva Santos',
        nascimento: '1985-06-15',
        situacao: 'REGULAR',
        mae: 'Maria Silva Santos',
        endereco: {
          logradouro: 'Rua das Flores',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          uf: 'SP',
          cep: '01001-000'
        }
      },
      '98765432100': {
        nome: 'Maria Oliveira Souza',
        nascimento: '1990-03-22',
        situacao: 'REGULAR',
        mae: 'Ana Oliveira Souza',
        endereco: {
          logradouro: 'Avenida Brasil',
          numero: '456',
          bairro: 'Jardins',
          cidade: 'Rio de Janeiro',
          uf: 'RJ',
          cep: '22001-000'
        }
      }
    },
    cnpj: {
      '11222333000144': {
        nome: 'Empresa Exemplo Ltda',
        nomeFantasia: 'Exemplo Comércio',
        abertura: '2010-05-10',
        situacao: 'ATIVA',
        naturezaJuridica: 'Sociedade Empresária Limitada',
        endereco: {
          logradouro: 'Rua Comercial',
          numero: '789',
          bairro: 'Industrial',
          cidade: 'Curitiba',
          uf: 'PR',
          cep: '80000-000'
        }
      }
    }
  };
  
  return tipo === 'cpf' 
    ? (mockData.cpf[docLimpo] || null)
    : (mockData.cnpj[docLimpo] || null);
}

// ==================== ATUALIZAR A FUNÇÃO DE BUSCA ORIGINAL ====================
async function buscarCPFCNPJ(documento, tipo) {
  if (!documento) return null;
  
  const dados = await buscarDocumentoCompleto(documento);
  
  if (!dados) return null;
  
  // Detectar qual página/formulário está aberto
  const pageAtual = document.querySelector('.page.active');
  if (!pageAtual) return dados;
  
  const pageId = pageAtual.id;
  
  // Preencher formulários automaticamente
  switch(pageId) {
    case 'clientes':
      preencherFormularioClientes(dados);
      break;
      
    case 'elenco':
      preencherFormularioElenco(dados);
      break;
      
    case 'motoristas':
      preencherFormularioMotoristas(dados);
      break;
      
    case 'fornecedores':
      preencherFormularioFornecedores(dados);
      break;
      
    case 'usuarios_sistema':
      preencherFormularioUsuarios(dados);
      break;
  }
  
  return dados;
}

// ==================== FUNÇÕES DE PREENCHIMENTO POR FORMULÁRIO ====================
function preencherFormularioClientes(dados) {
  const nomeField = document.getElementById('nome_cliente');
  const nascimentoField = document.getElementById('data_nascimento_cliente');
  
  if (nomeField && dados.nome) {
    nomeField.value = dados.nome;
  }
  
  if (nascimentoField && dados.nascimento) {
    nascimentoField.value = dados.nascimento;
    if (typeof calcularIdadeOuTempo === 'function') {
      calcularIdadeOuTempo(nascimentoField, 'cliente');
    }
  }
  
  // Preencher endereço se existir nos dados
  if (dados.endereco) {
    preencherEndereco('cliente', dados.endereco);
  }
}

function preencherFormularioUsuarios(dados) {
  const nomeField = document.getElementById('nome_usuario');
  const cpfField = document.getElementById('cpf_usuario');
  
  if (nomeField && dados.nome) {
    nomeField.value = dados.nome;
  }
  
  if (cpfField && dados.cpf) {
    // Já está preenchido, apenas garantir formatação
    formatarCPF(cpfField);
  }
  
  // Se houver campo de nascimento
  const nascimentoField = document.getElementById('data_nascimento_usuario') || 
                         document.getElementById('data_admissao');
  if (nascimentoField && dados.nascimento) {
    nascimentoField.value = dados.nascimento;
  }
  
  // Preencher endereço se houver campos
  if (dados.endereco) {
    preencherEndereco('usuario', dados.endereco);
  }
}

function preencherFormularioFornecedores(dados) {
  const razaoSocialField = document.getElementById('razao_social_fornecedor');
  const nomeFantasiaField = document.getElementById('nome_fantasia_fornecedor');
  
  if (razaoSocialField && dados.nome) {
    razaoSocialField.value = dados.nome;
  }
  
  if (nomeFantasiaField && dados.nomeFantasia) {
    nomeFantasiaField.value = dados.nomeFantasia;
  }
  
  if (dados.endereco) {
    preencherEndereco('fornecedor', dados.endereco);
  }
  
  if (dados.contato && dados.contato.telefone) {
    const telField = document.getElementById('telefone_fornecedor');
    if (telField) telField.value = dados.contato.telefone;
  }
  
  if (dados.contato && dados.contato.email) {
    const emailField = document.getElementById('email_fornecedor');
    if (emailField) emailField.value = dados.contato.email;
  }
}

function preencherEndereco(tipo, endereco) {
  const campos = {
    logradouro: document.getElementById(`endereco_${tipo}`),
    numero: document.getElementById(`numero_${tipo}`),
    complemento: document.getElementById(`complemento_${tipo}`),
    bairro: document.getElementById(`bairro_${tipo}`),
    cidade: document.getElementById(`cidade_${tipo}`),
    estado: document.getElementById(`estado_${tipo}`),
    cep: document.getElementById(`cep_${tipo}`)
  };
  
  if (campos.logradouro && endereco.logradouro) {
    campos.logradouro.value = endereco.logradouro;
  }
  
  if (campos.numero && endereco.numero) {
    campos.numero.value = endereco.numero;
  }
  
  if (campos.bairro && endereco.bairro) {
    campos.bairro.value = endereco.bairro;
  }
  
  if (campos.cidade && endereco.cidade) {
    campos.cidade.value = endereco.cidade;
  }
  
  if (campos.estado && endereco.uf) {
    campos.estado.value = endereco.uf;
  }
  
  if (campos.cep && endereco.cep) {
    campos.cep.value = endereco.cep;
  }
}

// ==================== FUNÇÃO AUXILIAR PARA FORMATAR CPF ====================
function formatarCPF(input) {
  let value = input.value.replace(/\D/g, '');
  
  if (value.length > 3 && value.length <= 6) {
    value = value.replace(/(\d{3})(\d+)/, '$1.$2');
  } else if (value.length > 6 && value.length <= 9) {
    value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  } else if (value.length > 9) {
    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
  }
  
  input.value = value;
  return value;
}

// ==================== ATUALIZAR FUNÇÃO DE FORMATAÇÃO ORIGINAL ====================
function formatDocumentFormulario(tipo) {
  const input = document.getElementById(`doc_${tipo}_cadastro`);
  if (!input) return;
  
  let value = input.value.replace(/\D/g, '');
  
  if (value.length <= 11) {
    // Formatar CPF
    if (value.length > 3 && value.length <= 6) {
      value = value.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (value.length > 6 && value.length <= 9) {
      value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
    }
  } else {
    // Formatar CNPJ
    if (value.length > 2 && value.length <= 5) {
      value = value.replace(/(\d{2})(\d+)/, '$1.$2');
    } else if (value.length > 5 && value.length <= 8) {
      value = value.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    } else if (value.length > 8 && value.length <= 12) {
      value = value.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    } else if (value.length > 12) {
      value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
    }
  }
  
  input.value = value;
  
  // Buscar automaticamente quando o documento estiver completo
  const docLimpo = input.value.replace(/\D/g, '');
  if (docLimpo.length === 11 || docLimpo.length === 14) {
    // Aguardar um pouco para o usuário terminar de digitar
    clearTimeout(window.buscaTimeout);
    window.buscaTimeout = setTimeout(() => {
      buscarCPFCNPJ(input.value, docLimpo.length === 11 ? 'cpf' : 'cnpj');
    }, 1000);
  }
}

// ==================== ADICIONAR LOADING DURANTE A BUSCA ====================
function mostrarLoadingBusca(mostrar) {
  let loadingDiv = document.getElementById('loading-busca');
  
  if (!loadingDiv && mostrar) {
    loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-busca';
    loadingDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 9999;
      ">
        <div style="text-align: center;">
          <div style="font-size: 20px; margin-bottom: 10px;">🔍</div>
          <div>Consultando dados...</div>
          <small>Aguarde um momento</small>
        </div>
      </div>
    `;
    document.body.appendChild(loadingDiv);
  } else if (loadingDiv && !mostrar) {
    loadingDiv.remove();
  }
}

// ==================== MODIFICAR FUNÇÃO DE BUSCA PARA INCLUIR LOADING ====================
async function buscarCPFCNPJComLoading(documento, tipo) {
  mostrarLoadingBusca(true);
  
  try {
    const resultado = await buscarCPFCNPJ(documento, tipo);
    
    if (resultado) {
      console.log('Dados encontrados via:', resultado.fonte || 'mock');
      
      // Mostrar notificação de sucesso
      mostrarNotificacao(`Dados encontrados via ${resultado.fonte || 'demonstração'}!`, 'success');
    } else {
      mostrarNotificacao('Documento não encontrado nas bases disponíveis', 'warning');
    }
    
    return resultado;
  } catch (error) {
    console.error('Erro na busca:', error);
    mostrarNotificacao('Erro ao buscar documento', 'error');
    return null;
  } finally {
    mostrarLoadingBusca(false);
  }
}

// ==================== FUNÇÃO DE NOTIFICAÇÃO ====================
function mostrarNotificacao(mensagem, tipo = 'info') {
  const notificacao = document.createElement('div');
  notificacao.className = `notificacao ${tipo}`;
  notificacao.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    ">
      ${mensagem}
    </div>
  `;
  
  document.body.appendChild(notificacao);
  
  setTimeout(() => {
    notificacao.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notificacao.remove(), 300);
  }, 3000);
}

// ==================== ATUALIZAR INITIALIZE PAGE COMPONENTS ====================
function initializePageComponents(pageId) {
  switch(pageId) {
    case 'dashboard':
      loadCalendarData();
      updateCalendar();
      break;
    case 'reservar_evento':
      setTimeout(() => {
        if (typeof configurarReservaEvento === 'function') configurarReservaEvento();
        configurarCamposEvento();
      }, 300);
      break;
    case 'clientes':
    case 'elenco':
    case 'motoristas':
    case 'fornecedores':
    case 'usuarios_sistema':
      // Configurar busca automática de documentos
      setTimeout(() => {
        const docInputs = document.querySelectorAll(`[id*="doc_"], [id*="cpf_"], [id*="cnpj_"]`);
        docInputs.forEach(input => {
          input.addEventListener('blur', function() {
            const docLimpo = this.value.replace(/\D/g, '');
            if (docLimpo.length === 11 || docLimpo.length === 14) {
              buscarCPFCNPJComLoading(this.value, docLimpo.length === 11 ? 'cpf' : 'cnpj');
            }
          });
        });
      }, 200);
      break;
  }
}
    
    // Simulação de busca (em produção, chamar API da Receita Federal)
    const dadosMock = {
      '12345678909': {
        nome: 'João Silva Santos',
        nascimento: '1985-06-15',
        situacao: 'REGULAR'
      },
      '98765432100': {
        nome: 'Maria Oliveira Souza',
        nascimento: '1990-03-22',
        situacao: 'REGULAR'
      }
    };
    
    if (dadosMock[docLimpo]) {
      const dados = dadosMock[docLimpo];
      
      // Preencher campos automaticamente baseado no formulário atual
      const pageAtual = document.querySelector('.page.active').id;
      
      switch(pageAtual) {
        case 'clientes':
          document.getElementById('nome_cliente').value = dados.nome;
          if (dados.nascimento) {
            document.getElementById('data_nascimento_cliente').value = dados.nascimento;
            calcularIdadeOuTempo(document.getElementById('data_nascimento_cliente'), 'cliente');
          }
          break;
          
        case 'elenco':
          document.getElementById('nome_elenco').value = dados.nome;
          if (dados.nascimento) {
            document.getElementById('data_nascimento_elenco').value = dados.nascimento;
            calcularIdadeOuTempo(document.getElementById('data_nascimento_elenco'), 'elenco');
          }
          break;
          
        case 'motoristas':
          document.getElementById('nome_motoristas').value = dados.nome;
          if (dados.nascimento) {
            document.getElementById('data_nascimento_motoristas').value = dados.nascimento;
            calcularIdadeOuTempo(document.getElementById('data_nascimento_motoristas'), 'motoristas');
          }
          break;
      }
      
      return dados;
    }
    
    // Para produção, descomente e ajuste esta parte:
    /*
    const response = await fetch(`https://api.receita.federal.gov.br/consulta/${tipo}/${docLimpo}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer SEU_TOKEN_AQUI',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const dados = await response.json();
      // Processar dados da Receita Federal
      return dados;
    }
    */
    
  } catch (error) {
    console.error('Erro ao buscar CPF/CNPJ:', error);
  }
  
  return null;
}

// Modificar a função de formatação para chamar a busca
function formatDocumentFormulario(tipo) {
  const input = document.getElementById(`doc_${tipo}_cadastro`);
  let value = input.value.replace(/\D/g, '');
  
  if (value.length <= 11) {
    // CPF
    if (value.length > 3 && value.length <= 6) {
      value = value.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (value.length > 6 && value.length <= 9) {
      value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
    }
  } else {
    // CNPJ
    if (value.length > 2 && value.length <= 5) {
      value = value.replace(/(\d{2})(\d+)/, '$1.$2');
    } else if (value.length > 5 && value.length <= 8) {
      value = value.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    } else if (value.length > 8 && value.length <= 12) {
      value = value.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    } else if (value.length > 12) {
      value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
    }
  }
  
  input.value = value;
  
  // Buscar automaticamente quando o documento estiver completo
  if ((value.length === 14 && tipo === 'cpf') || (value.length === 18 && tipo === 'cnpj')) {
    buscarCPFCNPJ(value, value.length === 14 ? 'cpf' : 'cnpj');
  }
}
// Inicializar sistema
function inicializarSistema() {
  // Gerar IDs para formulários abertos
  const formularios = ['clientes', 'casa_de_festas', 'elenco', 'personagens', 
                      'motoristas', 'fornecedores', 'funcionarios', 'usuarios_sistema'];
  
  formularios.forEach(form => {
    if (document.getElementById(`ID_${form.replace('sistema', '').replace('_de_', '_')}`)) {
      inicializarID(form.replace('sistema', '').replace('_de_', '_'));
    }
  });
  
  // Carregar lista de usuários
  atualizarListaUsuarios();
  
  // Configurar evento de submit do formulário de usuário
  const formUsuario = document.getElementById('formUsuario');
  if (formUsuario) {
    formUsuario.addEventListener('submit', function(e) {
      e.preventDefault();
      salvarUsuario();
    });
  }
}

// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  inicializarSistema();
});
// Adicione esta função no início do arquivo ou junto com as outras funções de inicialização
function configurarEventoSalvarUsuario() {
  const btnSalvar = document.getElementById('btnSalvarUsuario');
  if (btnSalvar) {
    btnSalvar.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      salvarUsuario();
    });
  }
  
  // Alternativa: adicionar evento ao formulário se o botão não for encontrado
  const formUsuario = document.getElementById('formUsuario');
  if (formUsuario && !btnSalvar) {
    formUsuario.addEventListener('submit', function(e) {
      e.preventDefault();
      salvarUsuario();
    });
  }
}
// VARIÁVEIS GLOBAIS
let currentOpenMenu = null;
let currentDate = new Date();
let eventos = JSON.parse(localStorage.getItem('eventos') || '[]');

// INICIALIZAÇÃO PRINCIPAL
document.addEventListener('DOMContentLoaded', function() {
    // Verifica login
    if (!localStorage.getItem('loggedIn')) {
        window.location.href = 'login.html';
        return;
    }
    corrigirEstruturaInicial();
    setupEventListeners();
    initializeBasicComponents();
    // Mostra dashboard inicial
    setTimeout(() => { showPage('dashboard'); }, 100);
});

// CORRIGE ESTRUTURA INICIAL
function corrigirEstruturaInicial() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.classList.add('active');
        dashboard.style.display = 'block';
    }
    const main = document.getElementById('main');
    if (main) {
        main.style.marginLeft = '260px';
        main.style.marginTop = '0';
        main.style.paddingTop = '0';
        main.style.minHeight = 'calc(100vh - var(--topbar-height))';
    }
}

// EVENT LISTENERS ÚNICOS
function setupEventListeners() {
    // Navegação de páginas
    document.querySelectorAll('[data-page]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });
    // Toggle de menus
    document.querySelectorAll('[data-toggle]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const menuId = this.getAttribute('data-toggle');
            toggleMenu(menuId, this);
        });
    });
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Deseja realmente sair do sistema?')) {
                localStorage.removeItem('loggedIn');
                localStorage.removeItem('userName');
                window.location.href = 'login.html';
            }
        });
    }
}

// NAVEGAÇÃO DE PÁGINAS
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
    page.style.display = 'none';
  });
  
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    targetPage.style.display = 'block';
    
    // Inicializar componentes específicos da página
    setTimeout(() => {
      initializePageComponents(pageId);
      
      // Configurar eventos para formulário de usuários
      if (pageId === 'usuarios_sistema') {
        configurarEventoSalvarUsuario();
        configurarBuscaCPFUsuario();
      }
    }, 50);
    
    localStorage.setItem('currentPage', pageId);
  }
  
  window.scrollTo(0, 0);
}


// TOGGLE DE MENUS
function toggleMenu(menuId, buttonElement) {
    const menu = document.getElementById(menuId);
    if (!menu) return;
    const isVisible = menu.style.display === 'block';
    if (currentOpenMenu && currentOpenMenu !== menu) {
        currentOpenMenu.style.display = 'none';
        const prevButton = document.querySelector(`[data-toggle="${currentOpenMenu.id}"]`);
        if (prevButton) prevButton.classList.remove('active');
    }
    menu.style.display = isVisible ? 'none' : 'block';
    buttonElement.classList.toggle('active', !isVisible);
    currentOpenMenu = !isVisible ? menu : null;
}

// INICIALIZAÇÃO DE COMPONENTES BÁSICOS
function initializeBasicComponents() {
    updateClock();
    setInterval(updateClock, 1000);
    updateUserInfo();
    loadDashboardData();
    atualizarSelectPersonagens();
}

// INICIALIZAÇÃO DE COMPONENTES POR PÁGINA
function initializePageComponents(pageId) {
    switch(pageId) {
        case 'dashboard':
            loadCalendarData();
            updateCalendar();
            break;
        case 'reservar_evento':
            setTimeout(() => {
                if (typeof configurarReservaEvento === 'function') configurarReservaEvento();
                configurarCamposEvento();
            }, 300);
            break;
        case 'personagens':
            const fotoInput = document.getElementById('foto_personagem');
            if (fotoInput && typeof previewFotoPersonagem === 'function') {
                fotoInput.addEventListener('change', function() { previewFotoPersonagem(this); });
            }
            break;
    }
}


// DASHBOARD E CALENDÁRIO
function loadDashboardData() {
    loadCalendarData();
    if (eventos.length > 0) {
        eventos.sort((a, b) => new Date(a.data) - new Date(b.data));
        const hoje = new Date().toISOString().split('T')[0];
        const eventoFuturo = eventos.find(e => e.data >= hoje);
        if (eventoFuturo) {
            document.getElementById('nextEventDate').textContent = formatarData(eventoFuturo.data);
            document.getElementById('nextEventTime').textContent = eventoFuturo.hora || '--:--';
            document.getElementById('nextEventClient').textContent = eventoFuturo.cliente || 'Cliente não informado';
            document.getElementById('nextEventLocation').textContent = eventoFuturo.local || '--';
        }
    }
}
function loadCalendarData() {
    eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
}
function updateCalendar() {
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const currentMonthElement = document.getElementById('currentMonth');
    if (currentMonthElement) {
        currentMonthElement.textContent =
            `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    const calendar = document.getElementById('calendar');
  calendar.innerHTML = `<div class="calendar-grid">${generateCalendarHTML()}</div>`;
}
function generateCalendarHTML() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let html = '';
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    diasSemana.forEach(dia => { html += `<div class="calendar-day-header">${dia}</div>`; });
    for (let i = 0; i < firstDay; i++) html += '<div class="calendar-day-empty"></div>';
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const eventosNoDia = eventos.filter(e => e.data === dateStr);
        const isToday = isCurrentDay(day, month, year);
        html += `<div class="calendar-day${isToday ? ' today' : ''}"><div class="day-number">${day}</div>`;
        eventosNoDia.slice(0, 2).forEach(e => {
            const title = `${e.cliente || 'Evento'}${e.hora ? ` - ${e.hora}` : ''}`;
            html += `<div class="event-indicator" title="${title}">${e.cliente?.substring(0, 10) || 'Evento'}</div>`;
        });
        if (eventosNoDia.length > 2)
            html += `<div class="event-indicator">+${eventosNoDia.length - 2} mais</div>`;
        html += '</div>';
    }
    return html;
}
function isCurrentDay(day, month, year) {
    const hoje = new Date();
    return hoje.getDate() === day && hoje.getMonth() === month && hoje.getFullYear() === year;
}
function previousMonth() { currentDate.setMonth(currentDate.getMonth() - 1); updateCalendar(); }
function nextMonth() { currentDate.setMonth(currentDate.getMonth() + 1); updateCalendar(); }

// UTILITÁRIAS
function formatarData(dataString) {
    if (!dataString) return '--/--/----';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}
function updateClock() {
    const clockElement = document.getElementById('userClock');
    if (clockElement) clockElement.textContent =
        new Date().toLocaleTimeString('pt-BR');
}
function updateUserInfo() {
    const userName = localStorage.getItem('userName') || 'Administrador';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) userNameElement.textContent = userName;
}
function atualizarSelectPersonagens() {
    const select = document.getElementById('personagem_select');
    if (!select) return;
    try {
        const personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
        select.innerHTML = '<option value="">— selecione —</option>';
        personagens.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.nome} ${p.valor ? `(${p.valor})` : ''}`;
            select.appendChild(option);
        });
    } catch (error) { }
}
function configurarCamposEvento() {
    const horaEvento = document.getElementById('hora_evento');
    const duracao = document.getElementById('duracao');
    const horaSaida = document.getElementById('hora_saida');
    if (horaEvento && duracao && horaSaida) {
        const calcular = function() {
            if (horaEvento.value && duracao.value) {
                const [horas, minutos] = horaEvento.value.split(':').map(Number);
                const duracaoNum = parseInt(duracao.value);
                const dataEvento = new Date();
                dataEvento.setHours(horas, minutos, 0, 0);
                dataEvento.setHours(dataEvento.getHours() + duracaoNum);
                horaSaida.value =
                    `${String(dataEvento.getHours()).padStart(2, '0')}:${String(dataEvento.getMinutes()).padStart(2, '0')}`;
            }
        };
        horaEvento.addEventListener('change', calcular);
        duracao.addEventListener('input', calcular);
    }
}

// EXPORTAÇÕES GLOBAIS
window.showPage = showPage;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.calcularHoraSaida = configurarCamposEvento;

console.log('✅ Script corrigido carregado com sucesso');
