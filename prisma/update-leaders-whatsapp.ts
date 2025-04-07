import { PrismaClient } from "@prisma/client";
import { distance } from "fastest-levenshtein";
import * as readline from "readline";

const prisma = new PrismaClient();

interface LeaderCSVData {
  nome: string;
  email: string;
  telefone: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      const normalizedAnswer = answer.toLowerCase().trim();
      resolve(["y", "yes", "s", "sim"].includes(normalizedAnswer));
    });
  });
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function normalizePhoneNumber(phone: string): string {
  const phoneWithoutSpaces = phone.trim().replace(/\s+/g, "");
  if (phoneWithoutSpaces.startsWith("+55")) return phoneWithoutSpaces;
  if (phoneWithoutSpaces.startsWith("55")) return "+" + phoneWithoutSpaces;
  return "+55" + phoneWithoutSpaces;
}

function fixEmail(email: string): string {
  if (!email.includes("@")) {
    // Supondo domínio mais comum:
    return email + "@gmail.com";
  }
  return email.toLowerCase().trim();
}

function isSimilar(a: string, b: string): boolean {
  const aNorm = normalizeString(a);
  const bNorm = normalizeString(b);
  return (
    aNorm.includes(bNorm) ||
    bNorm.includes(aNorm) ||
    distance(aNorm, bNorm) <= 3
  );
}

async function updateLeadersWhatsapp() {
  try {
    console.log("\n=== ATUALIZADOR DE WHATSAPP PARA LÍDERES ===\n");

    const leadersFromCSV: LeaderCSVData[] =  [
        { nome: "PÁVIO DOMICIANO MUNIZ", email: "pavio.muniz@gmail.com", telefone: "+55 11 98775 6766" },
        { nome: "LUCAS MOURA VIEIRA", email: "lucas.mvieira01@gmail.com", telefone: "+55 11 97478 0593" },
        { nome: "ADEYEMI DE OLIVEIRA SILVA", email: "adeyeshua@gmail.com", telefone: "+55 11 98661 1321" },
        { nome: "ADRIANA DE MORAES COSTA", email: "dricosta@hotmail.com", telefone: "+55 11 97390 3360" },
        { nome: "ADRIANA DIAS DA SILVA PASSOS", email: "adri_ozonio@hotmail.com", telefone: "+55 11 94516 0195" },
        { nome: "ALEXANDRA BONILLA", email: "alexandra.bonilla", telefone: "+55 11 98835 3296" },
        { nome: "ALINE AMADO SIMAS", email: "aline.amado.simas", telefone: "+55 11 98132 1604" },
        { nome: "ANA MARIA DE SOUZA TURINI", email: "anaturini@hotmail.com", telefone: "+55 97 15036 12" },
        { nome: "ANDRE GONÇALVES", email: "andregoncalves.aig@gmail.com", telefone: "+55 11 99407 4451" },
        { nome: "ANTONIO LUIS SAMPAIO GARCIA", email: "antonioluisgarcia7@gmail.com", telefone: "+55 11 99595 7931" },
        { nome: "BARBARA FRANCO DO NASCIMENTO", email: "barbara.franco@outlook.com", telefone: "+55 11 98699 8579" },
        { nome: "BIANCA SIQUEIRA", email: "biancasiqueira00@hotmail.com", telefone: "+55 11 94887 3393" },
        { nome: "CAMILA BARROS PEREIRA DA SILVA", email: "camila_7jc@hotmail.com", telefone: "+55 11 95450 6821" },
        { nome: "JUNE PARREIRA", email: "parreirajune@yahoo.com.br", telefone: "+55 11 98415 6053" },
        { nome: "CARMEN SILVIA RIBEIRO DE CARVALHO SEILER", email: "carmenseiler@yahoo.com.br", telefone: "+55 11 99205 9000" },
        { nome: "CELINA MARIA DA SILVA", email: "celina.escolar@gmail.com", telefone: "+55 11 99962 5950" },
        { nome: "CELSO EIGI KAMIYA", email: "celsoekamiya@gmail.com", telefone: "+55 11 94909 0885" },
        { nome: "DANIELE CAMARGO DE DEUS NASCIMENTO", email: "dany_smaily@hotmail.com", telefone: "+55 11 96601 1638" },
        { nome: "DENISE CERQUEIRA CASTRO BARBOSA", email: "deniseccbarbosa@gmail.com", telefone: "+55 11 99472 7580" },
        { nome: "DENNIS WELDON COELHO", email: "denniscoelho@hotmail.com", telefone: "+55 11 98175 0115" },
        { nome: "ÉRIKA BARBOSA BARRETO DE CAMPOS", email: "erika.bcampos", telefone: "+55 11 98201 1782" },
        { nome: "ESTER YURIKA HAYASHI TOMIEIRO", email: "esterhayashi@gmail.com", telefone: "+55 11 99192 5858" },
        { nome: "FABIANA SANTUCCI SILVA", email: "fabi_santucci@hotmail.com", telefone: "+55 11 98407 0383" },
        { nome: "FELIPE ZAPALÁ", email: "felipe.zapala.moreira", telefone: "+55 11 98552 0215" },
        { nome: "GRAZIELA DE CASSIA SCHMITT SILVA LEAL DE MELO", email: "grazielaschmitt2605@gmail.com", telefone: "+55 21 99375 2611" },
        { nome: "GREGORY BALDIVIESO ZAPANI VICENTE", email: "gregv107@gmail.com", telefone: "+55 11 97125 5400" },
        { nome: "HELIEZER JACOB GIMENES RODRIGUES", email: "heliezergimenes@gmail.com", telefone: "+55 11 98756 8571" },
        { nome: "HIME GOMES DA SILVA CANDIDO", email: "himebrito@yahoo.com.br", telefone: "+55 11 97262 3863" },
        { nome: "LEHONG HUANG", email: "lucashlh@outlook.com", telefone: "+55 12 98113 4454" },
        { nome: "ISABELLE GARGALAK CAVALCANTE DE ASSIS", email: "isabellegargalak@hotmail.com", telefone: "+55 11 97137 0527" },
        { nome: "JOAO HENRIQUE SANTOS DE CAMPOS", email: "joao.henrique16@yahoo.com.br", telefone: "+55 11 97679 0965" },
        { nome: "JOÃO MARCELO ARAÚJO MELO", email: "joaomelog@gmail.com", telefone: "+55 11 99100 1737" },
        { nome: "JULIA IUKO KAWADA HAYASHI", email: "juliahayashi10@gmail.com", telefone: "+55 11 95307 6177" },
        { nome: "KARINE DANTAS DE ARAÚJO", email: "karine-dantas@hotmail.com", telefone: "+55 11 98091 6618" },
        { nome: "LEONARDO FELTRIM", email: "leonardofeltrim@gmail.com", telefone: "+55 11 97663 3113" },
        { nome: "LUCAS FERREIRA BOIAN", email: "lucasboian@gmail.com", telefone: "+55 11 97796 3748" },
        { nome: "LUCAS PEREIRA DOS SANTOS", email: "santosplucas@gmail.com", telefone: "+55 11 95967 8258" },
        { nome: "MARCIA ANGELA THE HUANG", email: "marciakthe@gmail.com", telefone: "+55 11 97668 3554" },
        { nome: "MARCO AURÉLIO OLIVEIRA", email: "marco.escolar@hotmail.com", telefone: "+55 11 99811 8134" },
        { nome: "MARLENE CRISTH SILVA", email: "marlene.cristh@gmail.com", telefone: "+55 11 99964 6607" },
        { nome: "MICHEL GRABOSCHII DE SOUZA LIMA", email: "migrabo@gmail.com", telefone: "+55 11 95747 7414" },
        { nome: "MIRIÃ OLIVEIRA SCARANO", email: "miria_scarano@yahoo.com.br", telefone: "+55 11 94840 1725" },
        { nome: "NATASHA YUKI KUBOTA MURATA", email: "natashayukik@gmail.com", telefone: "+55 11 98585 5876" },
        { nome: "NATHALIA FERREIRA BOIAN", email: "nathaliaboian@gmail.com", telefone: "+55 11 98710 2011" },
        { nome: "NIKOLAS FRANCO", email: "nickoxx1@gmail.com", telefone: "+55 11 99969 6904" },
        { nome: "NIVIANE DEGE MAGALHÃES LIMA", email: "nivianedege@hotmail.com", telefone: "+55 11 95758 7414" },
        { nome: "PATRÍCIA LUCIENE BUENO SOARES ANTUNES", email: "patybueno_77@hotmail.com", telefone: "+55 11 98137 0242" },
        { nome: "PATRÍCIA BALDIVIESO ZAPANI VICENTE", email: "patty_b.zapani@hotmail.com", telefone: "+55 11 98681 3077" },
        { nome: "PAULA SAMPAIO GARCIA", email: "paulasampaiogarcia@gmail.com", telefone: "+55 11 99595 5659" },
        { nome: "PAULA HATUMURA ALGE BRANCO RIBEIRO", email: "pabrancoribeiro@gmail.com", telefone: "+55 11 98480 8030" },
        { nome: "PAULO HENRIQUE OLIVEIRA SCARANO", email: "paulo.silva2@scania.com", telefone: "+55 11 94084 7969" },
        { nome: "PAULO LEAL DE MELO NETO", email: "paulolealmelo@gmail.com", telefone: "+55 21 98259 1029" },
        { nome: "RAFAEL CÂNDIDO LOURENÇO", email: "rafaelcandidolourenco@hotmail.com", telefone: "+55 11 94034 0949" },
        { nome: "RAFAELA TOURINHO ZAPALÁ", email: "rafaelaeduartt@gmail.com", telefone: "+55 11 98429 3830" },
        { nome: "RAPHAEL DE FREITAS ANTUNES", email: "raphaelimg@hotmail.com", telefone: "+55 11 98137 0222" },
        { nome: "RENATO ALEXANDRE HIROSHI AKAO", email: "renato.akao@gmail.com", telefone: "+55 11 94988 0188" },
        { nome: "RICARDO CASTRO BARBOSA", email: "prosono.rcbarbosa@gmail.com", telefone: "+55 11 98963 3575" },
        { nome: "ROSA ABE", email: "abe_rosa@hotmail.com", telefone: "+55 11 98754 3713" },
        { nome: "SOLANGE MORITA HISANO", email: "solangemorita@gmail.com", telefone: "+55 11 98485 9493" },
        { nome: "SUELI MIMURA YUHARA", email: "sueli@zionchurch.org.br", telefone: "+55 94 16108 01" },
        { nome: "SUZI DE OLIVEIRA SANTOS", email: "suzioliveira18@hotmail.com", telefone: "+55 11 99228 7219" },
        { nome: "TERESA CRISTINA RIBEIRO DE CARVALHO", email: "te_cris@hotmail.com", telefone: "+55 11 99715 2407" },
        { nome: "THIERRY DE ALMEIDA VOLPI", email: "thierryav@hotmail.com", telefone: "+55 11 97383 5362" },
        { nome: "VANESSA MERCADO LOBO PEREIRA REIS", email: "vanessamlp@gmail.com", telefone: "+55 98 3385 786" },
        { nome: "VITOR KEY MIMURA YUHARA", email: "vitor_yuhara@hotmail.com", telefone: "+55 11 97683 3431" },
        { nome: "WELLIDEISY DE SOUSA SEVERINO", email: "wellideisy.souza@gmail.com", telefone: "+55 11 99938 7214" },
        { nome: "ANDRE VICENTE CERQUEIRA", email: "cerqueira.andre89@gmail.com", telefone: "+55 11 99911 6841" },
        { nome: "MILENA VEGAS", email: "milenavegas@hotmail.com", telefone: "+55 11 95290 6301" },
        { nome: "BEATRIZ HIROMI MIURA", email: "beatrizhmiura@gmail.com", telefone: "+55 11 99623 2840" },
        { nome: "GUILHERME DINIZ RODRIGUES", email: "guidinizrodrigues@gmail.com", telefone: "+55 11 97203 4227" },
        { nome: "SILVIO MARTINS DE LEMOS", email: "silvio_m_lemos@terra.com.br", telefone: "+55 11 97310 7248" },
        { nome: "TAMIRES RAMOS", email: "tamirescabin@gmail.com", telefone: "+55 11 98443 1706" },
        { nome: "TITO KEN YAMAMOTO", email: "tito.ken", telefone: "+55 11 96909 5444" },
        { nome: "PAULA ANDREA APARECIDA YAMAMOTO", email: "paayamamoto@hotmail.com", telefone: "+55 11 98222 8981" },
        { nome: "GABRIEL NAMORATO MACHADO", email: "gabriel.namorato@idunamis.org", telefone: "+55 12 99642 2600" },
        { nome: "GUILHERME JUVENAL LOURENCO", email: "guilhermejlourenco@hotmail.com", telefone: "+55 11 99321 9305" },
        { nome: "CRISTINA HAN CHUNG", email: "cristinahan@gmail.com", telefone: "+55 11 98256 5400" },
        { nome: "GUILHERME LIMA CAVALCANTE DE ASSIS", email: "guilhermelcassis@gmail.com", telefone: "+55 11 98580 3450" },
        { nome: "LUIZ RICARDO GIORGI FILHO", email: "ricardo.giorgi.filho@gmail.com", telefone: "+55 11 99505 5418" },
        { nome: "MATHEUS MURATA PRADO", email: "mmurataprado@gmail.com", telefone: "+55 11 97229 5693" },
        { nome: "ANAH FRANCO", email: "anafrancan@gmail.com", telefone: "+55 11 95712 6797" },
        { nome: "BRUNO PETINATTE", email: "brunopetinatte.bp@gmail.com", telefone: "+55 11 94957 7583" },
        { nome: "MARCOS VINÍCIUS SANCHEZ", email: "marcosvsanchez@hotmail.com", telefone: "+55 11 96845 7882" },
        { nome: "LUANA NERES CAMPOS PETINATTE", email: "luana.neres.ln@gmail.com", telefone: "+55 11 95154 8553" },
        { nome: "ALESSANDRA DE SOUZA ROCHA DIAS", email: "alesrd@gmail.com", telefone: "+55 11 93144 3104" },
        { nome: "GERLANE JOYCE MARQUES DA SILVA ROCHA", email: "gerlane-rocha2012@hotmail.com", telefone: "+55 11 97645 4104" },
        { nome: "LEONARDO RIBEIRO NETO", email: "leonardoribeironett@gmail.com", telefone: "+55 11 96931 2775" },
        { nome: "ABNER AUGUSTO F GARCIA", email: "abner.afg@gmail.com", telefone: "+55 11 99468 7163" },
        { nome: "MARTA LOPES DA SILVA", email: "lopemarta@gmail.com", telefone: "+55 95 5585 510" },
        { nome: "CAROLINE TEIXEIRA GRAF NUNES", email: "caroltgnunes@gmail.com", telefone: "+55 11 98309 2176" },
        { nome: "MILENA ROSÁRIO LIMA DA SILVA", email: "milena.rosario.lima.da.silva", telefone: "+55 11 98104 4139" },
        { nome: "PAULA CARVALHO CORREIA", email: "paula_sferj@yahoo.com.br", telefone: "+55 11 96441 4618" },
        { nome: "TALITA TAIS DA MOTA", email: "talitataisdamota@gmail.com", telefone: "+55 11 95424 4924" },
        { nome: "ROZANGELA SOUZA DOS SANTOS", email: "rozangela.silva.de.souza", telefone: "+55 11 98638 0858" },
        { nome: "MAYCK WILLIANS DE SOUZA ANDRADE", email: "mayckwillians10@gmail.com", telefone: "+55 11 94968 1429" },
        { nome: "BRUNA AGUIAR NOGUEIRA", email: "bruna.aguiar.nogueira", telefone: "+55 11 99911 6656" },
        { nome: "CAMILA CARVALHO DA SILVA", email: "eucarvalhocamila@gmail.com", telefone: "+55 11 98714 4268" },
        { nome: "CAROLINA SOUSA PAIXÃO", email: "carolina.sousapaixao@gmail.com", telefone: "+55 11 94849 5416" },
        { nome: "MÁRCIO ALESSANDRO DE MENDONÇA", email: "malessandromendonca@uol.com.br", telefone: "+55 11 94147 3737" },
        { nome: "ALEXANDRE BIANCHI", email: "alexandre.bianchi74@gmail.com", telefone: "+55 11 99719 2811" },
        { nome: "ANA VITÓRIA QUINTÃO BARBOSA", email: "ana.vitoriaquintao@gmail.com", telefone: "+55 11 98900 4426" },
        { nome: "GIULIANA GIANNAKOPOULOS DE SOUZA VIEIRA", email: "giulianag.souza@gmail.com", telefone: "+55 11 98447 5758" },
        { nome: "MARIO AUGUSTO TAVARES TEREZA", email: "marioattz@hotmail.com", telefone: "+55 11 98204 2262" },
        { nome: "MAYHARA STEPHANI REQUENA TESTI", email: "mahrequenatesti@gmail.com", telefone: "+55 11 98204 6208" },
        { nome: "IARA CRISTINA FAUSTINO BERTÃO", email: "treinamento@iarabertao.com.br", telefone: "+55 11 98202 0021" },
        { nome: "CAIO DE CAMPOS CALEGARI", email: "caiocalegari@hotmail.com", telefone: "+55 11 99381 7241" },
        { nome: "RAFAEL DE ARAÚJO ALMEIDA", email: "raaralmeida@gmail.com", telefone: "+55 12 98113 4873" },
        { nome: "DÉBORA DE PINHO FREITAS ALMEIDA", email: "deborapfreitas@yahoo.com.br", telefone: "+55 98 16469 60" },
        { nome: "SELAINE LIMA", email: "selaine.lima@hotmail.com", telefone: "+55 11 96633 6646" },
        { nome: "RODRIGO SANTINELO MOREIRA", email: "rodrigosantinelo@yahoo.com.br", telefone: "+55 11 98644 2586" },
        { nome: "CAIO FÁBIO FIGUEIREDO SANTANNA", email: "caiofab@me.com", telefone: "+55 11 98504 2157" },
        { nome: "NAYARA LACERDA", email: "nalacerda7@gmail.com", telefone: "+55 11 98305 3806" },
        { nome: "ALEXANDRE SANTOS FILHO", email: "alexandre.sto.filho@gmail.com", telefone: "+55 11 91346 2391" },
        { nome: "JULIA DOS SANTOS SILVA", email: "julia_ssantos@live.com", telefone: "+55 11 96138 3884" },
        { nome: "RENAN DOS SANTOS BATISTA LIMA", email: "renanbatista48@gmail.com", telefone: "+55 11 98373 2100" },
        { nome: "ANDERSON LUCAS VIDIO TOMIEIRO", email: "anderson.tomieiro@gmail.com", telefone: "+55 19 99345 7619" },
        { nome: "RODOLPHO CLEMENTE PAZZINI RODRIGUES DA SILVA", email: "rodolphopazzini@aasp.org.br", telefone: "+55 11 97554 2644" },
        { nome: "JOSUÉ KARP GALHANONE", email: "galhanone2411@gmail.com", telefone: "+55 11 99273 7955" },
        { nome: "AMANDA MAGALHÃES TONON RODRIGUES", email: "amandam.tonon@hotmail.com", telefone: "+55 11 99835 3186" },
        { nome: "DAVI MARQUES DE ARAÚJO", email: "varaujo92@gmail.com", telefone: "+55 11 95789 3635" },
        { nome: "ALCIDES IVAN BATALLAS GUERRA", email: "ivanbatallas19@gmail.com", telefone: "+55 11 98843 3994" },
        { nome: "JOÃO VICTOR CARRASCO PEREIRA", email: "joaovcarrascop@gmail.com", telefone: "+55 11 98193 0105" },
        { nome: "DANIEL FREITAS", email: "daniel.fclf@gmail.com", telefone: "+55 11 98837 8226" },
        { nome: "FABIO GODOI ISAGUIRRE", email: "fabio.isaguirre@gmail.com", telefone: "+55 11 99926 1115" },
        { nome: "FERNANDA SCAURI", email: "fe.scauri@hotmail.com", telefone: "+55 11 99510 3944" },
        { nome: "LEONARDO SCAURI INOCÊNCIO DA SILVA", email: "scaurileonardo8@gmail.com", telefone: "+55 11 97125 6671" },
        { nome: "MICHELLE ALVES DOS SANTOS", email: "msantos2512@gmail.com", telefone: "+55 11 96894 5224" },
        { nome: "FABRÍCIO LOPES", email: "lopesfabricio@outlook.com.br", telefone: "+55 11 97610 0517" },
        { nome: "ALEXANDRE SOARES MENDES", email: "ale.smendes1@gmail.com", telefone: "+55 11 98533 4422" },
        { nome: "CAIO BUENO", email: "bueno.caiof@gmail.com", telefone: "+55 11 95127 0195" },
        { nome: "JÉSSICA BUENO", email: "alves.jessicaf@gmail.com", telefone: "+55 11 98368 2580" },
        { nome: "FELIPE BATISTA DE LIMA", email: "felima0211@gmail.com", telefone: "+55 11 95341 2510" },
        { nome: "YENNY KIM", email: "yennycharlize@gmail.com", telefone: "+55 11 94133 2354" },
        { nome: "ANA BEATRIZ BARROS DE SOUZA LOPES", email: "bia_bsouza@hotmail.com", telefone: "+55 11 95134 0702" },
        { nome: "JÚLIA DA CRUZ GUERRA", email: "juliacruzg0142@gmail.com", telefone: "+55 11 98324 8569" },
        { nome: "ULISSES JOSE RIBEIRO DA SILVA", email: "ulisses.deia@gmail.com", telefone: "+55 11 96052 3906" },
        { nome: "ISRAEL ANIJAR", email: "israel.anijar@me.com", telefone: "+55 11 99362 9307" },
        { nome: "THAYNA SAMPAIO CRUZ", email: "thayna_scruz@hotmail.com", telefone: "+55 11 98997 191" },
        { nome: "CAIO AUGUSTO ALVES DA SILVA", email: "caio_augusto96@hotmail.com", telefone: "+55 11 94197 7702" },
        { nome: "ADRIANO BRITO DE OLIVEIRA", email: "adrianobrito01@gmail.com", telefone: "+55 11 93800 3567" },
        { nome: "ALESSANDRA GUERRA SANCHEZ", email: "ale.gg.sanchez@hotmail.com", telefone: "+55 11 98531 4213" },
        { nome: "ANA QUÉSIA DA SILVA WASEM", email: "aquesiawasem@gmail.com", telefone: "+55 11 94386 2807" },
        { nome: "BRUNO BIANCO", email: "bbianko@hotmail.com", telefone: "+55 11 99277 4387" },
        { nome: "EDUARDO PEREIRA COSTA", email: "dudacosta1@hotmail.com", telefone: "+55 11 99277 2852" },
        { nome: "EVELLYN DANIELE GRASSI DE ASSIS", email: "evellynassis1@hotmail.com", telefone: "+55 11 98880 1434" },
        { nome: "FILIPE DE CAMARGO REIS", email: "filipecamargoreis19@gmail.com", telefone: "+55 11 98896 7429" },
        { nome: "GABRIELA GONÇALVES", email: "gabccbarbosa@gmail.com", telefone: "+55 11 98873 3838" },
        { nome: "GABRIELLA RODRIGUES FERREIRA DE SOUZA", email: "gabriellarfs@icloud.com", telefone: "+55 11 93282 6967" },
        { nome: "GIULIA SOUSA RAMOS", email: "caroline.giulia99@gmail.com", telefone: "+55 11 95948 4061" },
        { nome: "IVONETE MARIA DOS REIS BRITO", email: "ivonetem.reis@gmail.com", telefone: "+55 11 96798 8950" },
        { nome: "JÉSSICA MEDEIROS SANT' ANA", email: "jeeh-sant40@hotmail.com", telefone: "+55 11 97016 6085" },
        { nome: "JOSÉ LUCAS OLIVEIRA DE SENA", email: "joselucas.to@gmail.com", telefone: "+55 11 99378 1033" },
        { nome: "JULIA DA SILVA WASEM", email: "juliawasem@gmail.com", telefone: "+55 11 94388 2808" },
        { nome: "JULIANA BARGAS DOS SANTOS", email: "bargas.juliana@gmail.com", telefone: "+55 11 99193 4271" },
        { nome: "PALOMA DO NASCIMENTO COSTA", email: "paloma.costa240994@gmail.com", telefone: "+55 11 95862 8543" },
        { nome: "PAULO RICARDO FERNANDES GOMES", email: "pauloricardo.fernandesgomes@yahoo.com.br", telefone: "+55 11 97618 6238" },
        { nome: "RICARDO FERREIRA GASPAR DE SOUZA NEVES", email: "nevesarquitetura@gmail.com", telefone: "+55 11 99303 6956" },
        { nome: "KARINA CATTANEO NICOLAU NEVES", email: "karinanikolau@hotmail.com", telefone: "+55 11 99396 2042" },
        { nome: "ÉLIKA GONÇALVES MENDES", email: "lilikajor@gmail.com", telefone: "+55 11 94168 4088" },
        { nome: "GIANE DE SANTANA", email: "gssantos.sp@gmail.com", telefone: "+55 11 98293 3581" },
        { nome: "MÁRCIO LUIZ MENDES", email: "dr.mendesvet@gmail.com", telefone: "+55 11 94168 6059" },
        { nome: "MARCIO RUFATO", email: "omarciorufato@gmail.com", telefone: "+55 11 94848 7566" },
        { nome: "MATEUS KERR CARPIGIANI DE LARA", email: "mateuskerr17@gmail.com", telefone: "+55 11 96389 2670" },
        { nome: "RAFAEL ARRUDA", email: "afinhaa@hotmail.com", telefone: "+55 11 97474 2880" },
        { nome: "SANDRA VECCHIA", email: "svecchia96@gmail.com", telefone: "+55 11 99196 6277" },
        { nome: "GABRIEL BORGES", email: "xborges.gabriel@gmail.com", telefone: "+55 11 98954 3018" },
        { nome: "JACQUELINE MENEZES DE OLIVEIRA", email: "jacquemeenezes@hotmail.com", telefone: "+55 62 99348 0401" },
        { nome: "LUCIANA MOREIRA RODRIGUES", email: "luciana.moreira.rodrigues", telefone: "+55 11 98962 2441" },
        { nome: "RENATO SANTOS DE JESUS", email: "renato6263@gmail.com", telefone: "+55 11 96157 8424" },
        { nome: "SANDRA MENDES", email: "mendonaa.sandra@bol.com.br", telefone: "+55 11 99870 1633" },
        { nome: "VINÍCIUS MARANHÃO DA SILVA", email: "vinicius.maranhao@ymail.com", telefone: "+55 11 97487 1986" },
        { nome: "EDSON DOS SANTOS ROCHA", email: "edson.gerlane", telefone: "+55 11 98861 2755" },
        { nome: "RODRIGO MARAFON", email: "marafonrodrigo@hotmail.com", telefone: "+55 19 99349 2981" },
        { nome: "INGRID KARINE TORRES SANTOS", email: "ingridittorres@gmail.com", telefone: "+55 11 98499 2231" },
        { nome: "LUCIANA DE JESUS MENDES ANICETO", email: "lm3894421@gmail.com", telefone: "+55 11 94922 9623" },
        { nome: "OTÁVIO ANICETO DE OLIVEIRA JUNIOR", email: "otaviodeoliveira@yahoo.com.br", telefone: "+55 11 96840 9904" },
        { nome: "LETÍCIA ALEXANDRINA DE SOUZA SCHEELERG", email: "leticiascheelerg@gmail.com", telefone: "+55 11 93230 3726" },
        { nome: "ALEXANDRE OLIVEIRA", email: "alexandre_nro@outlook.com", telefone: "+55 11 97316 1360" },
        { nome: "PEDRO MARTINS NASCIMENTO", email: "pedro101001@gmail.com", telefone: "+55 11 97745 0007" },
        { nome: "LUCAS VINICIUS GUSSON DA SILVA", email: "lucas.gusson", telefone: "+55 11 97497 2538" },
        { nome: "SUNAMITA MARIA DE JESUS SILVA", email: "Sunamitasilva98@gmail.com", telefone: "+55 11 98100 1802" },
        { nome: "BEATRIZ ROQUE BEZERRA", email: "byaroque@hotmail.com", telefone: "+55 11 99873 7683" },
        { nome: "DRIELLE BASILIO MAGRI", email: "dri.basilio08@gmail.com", telefone: "+55 11 98710 8540" },
        { nome: "DANIEL WASEM", email: "wasemassessoria@gmail.com", telefone: "+55 11 91102 0173" },
        { nome: "JONATAS FERREIRA FILLIETAZ", email: "jonatasff@gmail.com", telefone: "+55 11 98351 9073" },
        { nome: "LUCAS BRAWLYO PEREIRA VIEIRA", email: "lucasbrawlyo@gmail.com", telefone: "+55 11 94321 9585" },
        { nome: "KEILA VERA VIDAL", email: "veravidal.keila@gmail.com", telefone: "+56 9 7471 9054" },
        { nome: "VICTORIA HERNANDES GUSMAO", email: "vic_h_gusmao@icloud.com", telefone: "+55 98 3369 435" },
        { nome: "ANDERSON LOPES", email: "contato.d3@hotmail.com", telefone: "+55 11 94739 6358" },
        { nome: "ESTEVÃO CONTAGE AMIN", email: "estevao.amin@gmail.com", telefone: "+55 24 98823 8185" },
        { nome: "GABRIEL CASSEMIRO", email: "gabicassimiro90@gmail.com", telefone: "+55 11 96931 1338" },
        { nome: "JESSE FERREIRA SANTOS", email: "jesseferreira2809@gmail.com", telefone: "+55 11 96648 3222" },
        { nome: "LUCAS MEDEIROS DE OLIVEIRA", email: "medeiros050996@gmail.com", telefone: "+55 11 96600 6954" },
        { nome: "NATALIA ALVES DANTAS FRANCO FALIDO", email: "nataliafranco@outlook.com", telefone: "+55 11 96340 0389" },
        { nome: "ROONEY COELHO", email: "rooneycoelho@hotmail.com", telefone: "+55 11 94244 6025" },
        { nome: "TALITA MOTA CERQUEIRA LOPES", email: "tathytalita@gmail.com", telefone: "+55 11 96608 9777" },
        { nome: "GABRIEL MARQUES DA SILVA", email: "gabrielmarques1105@gmail.com", telefone: "+55 11 98931 9971" },
        { nome: "KAMYLLA GRADVOHL ALBUQUERQUE", email: "kamyllagradvohl@gmail.com", telefone: "+55 11 93361 0611" },
        { nome: "ROSANA BORIN SANTANA", email: "rosana.borin@gmail.com", telefone: "+55 19 98129 0694" },
        { nome: "ANSELMO SANTANA", email: "anselmo_santana@hotmail.com", telefone: "+55 19 99684 4088" },
        { nome: "SUELEN PEDRI GATSCHER ALEXANDRE", email: "suelenagp@hotmail.com", telefone: "+55 99 00245 10" },
        { nome: "SUSANA FLÁVIA GOMES DO AMARAL", email: "susaninhamaral@hotmail.com", telefone: "+55 11 98404 0355" },
        { nome: "WILLIAN DA SILVA SANTOS", email: "willian.lvbmet@outlook.com", telefone: "+55 11 96577 5116" },
        { nome: "JOÃO PAULO DE CASTRO E SILVA", email: "jpcs_1@hotmail.com", telefone: "+55 11 94051 2670" },
        { nome: "GRACE KELLY ASSIS CAVALLI", email: "gracekellyac@hotmail.com", telefone: "+55 11 95389 4468" },
        { nome: "JAILTON SACRAMENTO DOS SANTOS", email: "jailton_s_santos@hotmail.com", telefone: "+55 11 98339 5437" },
        { nome: "VICTOR MATHEUS JESUS CAETANO", email: "victorsax12@gmail.com", telefone: "+55 11 97459 6047" },
        { nome: "LEONARDO MENDES", email: "LMENDESBERG@GMAIL.COM", telefone: "+55 11 93943 1775" },
        { nome: "JULIA SALAS", email: "JULIASLIMA@LIVE.COM", telefone: "+55 11 95186 6067" },
        { nome: "DANTON LOURENÇO", email: "danton.louren@gmail.com", telefone: "+55 24 99903 0186" },
        { nome: "MATEUS AUGUSTO ALEXANDRE", email: "mattalexandreoficial@gmail.com", telefone: "+55 48 99858 9900" },
        { nome: "ALEX GONÇALVES SANTANA DE MORAIS", email: "alex_fmg@hotmail.com", telefone: "+55 11 94881 5491" },
        { nome: "RAPHAEL TAKESHI DE LIMA KOGA", email: "raphakoga.rk@gmail.com", telefone: "+55 41 99695 2300" },
        { nome: "MARINA CAMPELLO PERÁCIO", email: "marina.campello19@gmail.com", telefone: "+55 11 98196 3610" },
        { nome: "REBECA ESTE", email: "rebecaeste2@gmail.com", telefone: "+55 11 94035 6726" },
        { nome: "EVELYN QUIRINO", email: "evelyn_quirino@hotmail.com", telefone: "+55 11 98681 9677" },
        { nome: "BÁRBARA FERRAZ", email: "babifferraz@gmail.com", telefone: "+55 11 99313 8853" },
        { nome: "JESSYCA LAUANDA R DA COSTA", email: "jessyca.lauanda.r.costa", telefone: "+55 11 95882 1921" },
        { nome: "MAURECIR JUNIOR NEVES DOS SANTOS", email: "maurecirjunior@hotmail.com", telefone: "+55 44 99844 4673" },
        { nome: "NICOLAS BURIN MORETTI", email: "nikc.moretti@gmail.com", telefone: "+55 11 99193 9368" },
        { nome: "PALOMA CRYSTINA SILVA IGNACIO", email: "paloma.crystina.silva.ignacio", telefone: "+55 11 97098 9100" },
        { nome: "PATRÍCIA SERRA BIANCHI", email: "paty.serra.bianchi@hotmail.com", telefone: "+55 11 99970 8260" },
        { nome: "WILLIAM MARQUES COSTA", email: "imarxwill@gmail.com", telefone: "+55 11 98495 7959" },
        { nome: "ALESSANDRA MEDEIROS DE SOUZA", email: "alessandramedeiros01@hotmail.com", telefone: "+55 11 95300 1929" },
        { nome: "JEFFERSON JOAQUIM DE OLIVEIRA", email: "jefferson.sts.oliveira@gmail.com", telefone: "+55 11 97426 5739" },
        { nome: "CRISTIAN PEREIRA MACIEL", email: "cristiianbeu@gmail.com", telefone: "+55 11 94232 6639" },
        { nome: "NATHÁLIA REGINA DOS SANTOS COSTA", email: "scnathalia@hotmail.com", telefone: "+55 81 98365 0524" },
        { nome: "LUCAS TERUO YUKOYAMA", email: "yukoyama.lucas@gmail.com", telefone: "+55 11 97605 7262" },
        { nome: "ASAPH KOLLN DE CARVALHO", email: "asaphkolln@gmail.com", telefone: "+55 51 98167 2829" },
        { nome: "NAOMI BRITTO", email: "naomibritto.nb@gmail.com", telefone: "+55 11 97338 2353" },
        { nome: "ARTHUR CONDE", email: "arthur.freitas.conde@hotmail.com", telefone: "+55 11 99103 6889" },
        { nome: "JOAO MARCOS POBBE DOS SANTOS", email: "joao.marcos.pobbe.dos.santos", telefone: "+55 11 99117 6593" },
        { nome: "MESSIAS VICTOR ASSUNÇÃO RIBEIRO DO NASCIMENTO", email: "victor.nascimento046@gmail.com", telefone: "+55 11 98664 7298" },
        { nome: "LUANA LIMA", email: "44895404854", telefone: "+55 19 98372 0914" },
        { nome: "JOÃO PEDRO MENEZES HUDSON", email: "jpmhudson@gmail.com", telefone: "+55 11 95606 6618" },
        { nome: "LUCAS DA COSTA RODRIGUES", email: "lucasdacostabrandao@hotmail.com", telefone: "+55 11 98618 5768" },
        { nome: "WITALO SILVA", email: "witalosilvacontato@gmail.com", telefone: "+55 11 95911 5112" },
        { nome: "KAROLAYNE CRISTINA DA SILVA", email: "karolaynesilvacris@gmail.com", telefone: "+55 11 99347 2558" },
        { nome: "ENZO HENRIQUE SPORTERO DOS SANTOS", email: "enzosportero9@gmail.com", telefone: "+55 11 97058 0949" },
        { nome: "FÁTIMA DOS SANTOS SIQUEIRA", email: "fasantossiqueira@gmail.com", telefone: "+55 99 96075 76" },
        { nome: "DERANA LOPES", email: "deranalopes@icloud.com", telefone: "+55 11 96343 7739" },
        { nome: "MARIANA MEDEIROS COSTA DE OLIVEIRA", email: "mmedeiros717@gmail.com", telefone: "+55 14 99772 8614" },
        { nome: "TATIANE DE CASTRO", email: "tatianedecastro@gmail.com", telefone: "+55 19 98115 3366" },
        { nome: "GIOVANNA VERRONE", email: "giovanna.verrone", telefone: "+55 11 98367 8444" },
        { nome: "THAINÁ MATIAS LOPES", email: "thaina.mlopes@gmail.com", telefone: "+55 11 99566 9698" },
        { nome: "RAFAEL ZOLDAN", email: "rf.zoldan@gmail.com", telefone: "+55 11 98575 8400" },
        { nome: "JESSICA RAMOS", email: "jessica.ramosautuori@gmail.com", telefone: "+55 11 95475 9541" },
        { nome: "MARISTELA FÁTIMA DE SOUZA OLIVEIRA", email: "maristela_fs@yahoo.com.br", telefone: "+55 96 2407 010" },
        { nome: "ANDRESSA YUKOYAMA", email: "andressa.crfeitosa@hotmail.com", telefone: "+55 11 94063 6294" },
        { nome: "PATRICK DE ALMEIDA VOLPI", email: "contatopatrickvolpi@gmail.com", telefone: "+55 11 97227 3033" },
        { nome: "NATHÁLIA ROCHA SILVA", email: "nathalia3335@hotmail.com", telefone: "+55 11 98390 5690" },
        { nome: "ISABELA BORGES", email: "contato.xborges@gmail.com", telefone: "+55 95 2244 428" },
        { nome: "IZADORA LIBERAL ZANINI", email: "izadoralzanini@gmail.com", telefone: "+55 11 97687 6054" },
        { nome: "YGOR VEIGA DE MORAES", email: "ygorveigam@gmail.com", telefone: "+55 11 95164 9319" },
        { nome: "BRUNA HAMU FELTRIM", email: "contatobrunahamu@gmail.com", telefone: "+55 21 99655 9069" },
        { nome: "BRUNO TEIXEIRA DA SILVA DE SOUZA", email: "brunoteixeira.police@gmail.com", telefone: "+55 11 94565 3308" },
        { nome: "THAÍS OLIMPIO", email: "THAISOLIMPIO19@GMAIL.COM", telefone: "+55 47 99188 9930" },
        { nome: "GABRIEL SILVA FIGUEREDO COSTA", email: "silva_costa2000@yahoo.com", telefone: "+55 11 96749 2215" },
        { nome: "TALITA RODRIGUES DAMASCENO BARBOSA", email: "talitardamasceno@gmail.com", telefone: "+55 11 95121 9375" },
        { nome: "NATALIA CORDEIRO CAVALCANTE CARVALHO", email: "natalia.cavalcante95@hotmail.com", telefone: "+55 11 95270 7526" },
        { nome: "INGRID SABINO DA SILVA", email: "di_sabino@hotmail.com", telefone: "+55 11 96074 7032" },
        { nome: "ALESSANDRA REIS LOURENÇO", email: "ale.rlourenco@gmail.com", telefone: "+55 11 95477 5269" },
        { nome: "BIANCA DE CASTRO", email: "bianca.97@hotmail.com", telefone: "+55 11 95107 5462" },
        { nome: "ARTHUR SALVATO DE FIGUEREDO BEDA", email: "arthurbeda97@gmail.com", telefone: "+55 11 97357 2221" },
        { nome: "BIANCA REGINA DA SILVA COSTA LOPES", email: "bianca.regina.da.silva.costa.lopes", telefone: "+55 11 99264 5979" },
        { nome: "MATHEUS HENRIQUE GOMES PAZ", email: "matheuspaz737@gmail.com", telefone: "+55 11 98506 0155" },
        { nome: "MICHELLE YUKIE UTSUNOMIYA", email: "michelle.yukie.utsunomiya", telefone: "+55 11 99947 2760" },
        { nome: "DOUGLAS RIBEIRO", email: "douglas.da.silva.ribeiro", telefone: "+55 21 96715 6942" },
        { nome: "RAFAEL ROCHA", email: "rafaelrochamv@gmail.com", telefone: "+55 48 99979 6719" },
        { nome: "CARLOS YUKITO MIYAZAKI", email: "carlos.yukito.miyazaki", telefone: "+55 11 96023 2435" },
        { nome: "AMANDA BRITO CAIRES DA SILVA", email: "amandabrito_caires@outlook.com", telefone: "+55 11 96449 9895" },
        { nome: "DIOVANA LEMOS ALVES FILLIETAZ", email: "diovana.alves@gmail.com", telefone: "+55 11 98209 1036" },
        { nome: "CASSIO EDUARDO OLIVEIRA DIAS", email: "djcaddu@hotmail.com", telefone: "+55 11 96932 0148" },
        { nome: "DHULIANE FERREIRA DEMENEGHE", email: "dhulianef@gmail.com", telefone: "+55 51 98583 8902" },
        { nome: "NICHOLAS DE OLIVEIRA DEMENEGHE", email: "nicodemeneghe@gmail.com", telefone: "+55 51 99104 0714" },
        { nome: "SOFIA KITZBERGER", email: "sofiakitzberger@hotmail.com", telefone: "+55 41 99944 4168" },
        { nome: "ALESSANDRA SUNAO", email: "alessandrasunao@hotmail.com", telefone: "+55 11 99184 7072" },
        { nome: "ANA MARIA BUENO SANTOS", email: "anabst2013@gmail.com", telefone: "+55 11 94703 3563" },
        { nome: "VICTOR LUIS LIRA ANTUNES", email: "victorluis_lira@hotmail.com", telefone: "+55 11 95157 3078" },
        { nome: "LUCAS ROMARYO NASCIMENTO BARBOSA", email: "lucasromaryo@hotmail.com", telefone: "+55 11 98306 1034" },
        { nome: "RONALD DOS SANTOS", email: "ronald.dos.santos", telefone: "+55 11 94722 1878" },
        { nome: "ISRAEL SANTOS DA PAIXÃO", email: "israelpaixao250@hotmail.com", telefone: "+55 11 96465 7625" },
        { nome: "HUGO MARTINS JOAO", email: "hugo.mj0214@gmail.com", telefone: "+55 11 94540 5858" },
        { nome: "CAMILA OLIVEIRA MARTINS", email: "ca12braga@gmail.com", telefone: "+55 11 95608 2287" },
        { nome: "KAYLEIGH GONCALVES GUIMARAES", email: "kaygguimaraes@gmail.com", telefone: "+55 11 94521 9805" },
        { nome: "GIULIA MATTEO CARRASCO", email: "giulia_matteo@hotmail.com", telefone: "+55 11 99625 2887" },
        { nome: "ESTHER VITÓRIA SOUSA RODRIGUES", email: "esthervih04@gmail.com", telefone: "+55 11 96121 4681" },
        { nome: "AMANDA CAMPOS SANTOS", email: "eu.amandac@gmail.com", telefone: "+55 11 93709 1581" },
        { nome: "MARIANA GONÇALVES VELOSO", email: "marianagoncalvesveloso@gmail.com", telefone: "+55 11 94733 2020" },
        { nome: "BEATRIZ ARLINDO DANTAS", email: "beatriz.arlindo.dantas", telefone: "+55 11 94010 2017" },
        { nome: "JOÃO IDER SILVA JUNIOR", email: "joaoider@gmail.com", telefone: "+55 35 99109 7533" },
        { nome: "GUSTAVO FINETO", email: "finetogustavo@gmail.com", telefone: "+55 11 99441 2122" },
        { nome: "KARINA LONGO", email: "karina.longo@yahoo.com.br", telefone: "+55 11 96059 7807" },
        { nome: "ANA BEATRIZ REIS", email: "ana.btreis@gmail.com", telefone: "+55 93 4815 058" },
        { nome: "CAROLINA LAZZARI BEZ", email: "carolbez7@gmail.com", telefone: "+55 21 98627 2406" },
        { nome: "MARIA ALICE LEAO", email: "salazaralice05@gmail.com", telefone: "+55 11 96075 8794" },
        { nome: "MATEUS MANOJO COSTA", email: "mateusmanojo@hotmail.com", telefone: "+55 11 97786 1715" },
        { nome: "GABRIELE DE OLIVEIRA PAULINO", email: "gabriele.paulino@live.com", telefone: "+55 11 98309 5318" },
        { nome: "THIAGO DOS SANTOS LOURENÇO", email: "thiago.lourenco_@hotmail.com", telefone: "+55 11 97806 4045" },
        { nome: "VICTOR HUGO DE FARIA GONÇALVES", email: "victorvalentehf@gmail.com", telefone: "+55 11 96414 1985" },
        { nome: "ALINE YUMI HIGA", email: "yumihiga@hotmail.com", telefone: "+55 11 98652 3495" },
        { nome: "GABRIEL CHEFALY", email: "gabrielchefaly7@gmail.com", telefone: "+55 19 99848 2231" },
        { nome: "FERNANDO MICHEL FERMIANO DOS SANTOS", email: "coachguerreiro@gmail.com", telefone: "+55 93 2328 320" },
        { nome: "LAURIENE APARECIDA DA CUNHA SANTOS", email: "laurieneacunha@yahoo.com.br", telefone: "+55 24 99300 9009" },
        { nome: "RAQUEL PEREIRA DA SILVA", email: "raquelprrs14@gmail.com", telefone: "+55 14 99879 6168" },
        { nome: "REBECCA MARTINS SALOMÃO MEDEIROS", email: "rebeccams.psico@gmail.com", telefone: "+55 11 95173 7217" },
        { nome: "ILEANA ESPEJO", email: "ileanaespejo.1@gmail.com", telefone: "+55 13 99797 4377" },
        { nome: "JOSAFA SANTANA", email: "Joe.santana1@outlook.com", telefone: "+55 11 96406 6416" },
        { nome: "LEONARDO PINEL BERNARDO VIEIRA ROCHA", email: "leopinelrocha@gmail.com", telefone: "+55 11 97138 8788" },
        { nome: "ANTONIO ANDRÉ PESSOA SILVA", email: "aandrepessoa_s@hotmail.com", telefone: "+55 86 99811 8212" },
        { nome: "JOÃO MARCOS TELES MOURA", email: "joao.mtmoura@gmail.com", telefone: "+55 11 94159 7124" },
        { nome: "LARISSA GROSS CARLOS", email: "larissagcarlos@gmail.com", telefone: "+55 51 99209 3356" },
        { nome: "LEVI GONÇALVES CAMILO", email: "levigcamilo@outlook.com", telefone: "+55 11 97096 9997" },
        { nome: "LIVIA BASTOS", email: "bastoslivia947@gmail.com", telefone: "+55 13 99795 1408" },
        { nome: "JOÃO VITOR GALACHO MONTEIRO", email: "joaovgalacho@gmail.com", telefone: "+55 13 99643 1616" },
        { nome: "GABRIEL MICHELAZZO", email: "gmrocha85@gmail.com", telefone: "+55 11 94728 4982" },
        { nome: "BIANCA MICHELAZZO", email: "biancabernardes@msn.com", telefone: "+55 11 95491 0804" },
        { nome: "VICTORIA FARIA SCHIMENES", email: "fariavictoria97@gmail.com", telefone: "+55 11 97625 6944" },
        { nome: "ANTONIO DA SILVA ARAUJO NETO", email: "antonioaraujon@gmail.com", telefone: "+55 62 98181 3569" },
        { nome: "GIOVANA RODRIGUES PIZZOTTI", email: "gizzotti03@gmail.com", telefone: "+55 11 99742 6303" },
        { nome: "LUCAS PIMENTA", email: "lucaspimenta2156@outlook.com", telefone: "+55 11 98626 7653" },
        { nome: "ANA CELIA ALVES DE OLIVEIRA", email: "anacelia-aa@hotmail.com", telefone: "+55 44 99999 0286" },
        { nome: "GESSICA DE OLIVEIRA ARRECHAVAL", email: "gessicaarrechaval@gmail.com", telefone: "+55 99 62049 99" },
        { nome: "BRUNA URIE BURIN MORETTI", email: "bruna.burin@gmail.com", telefone: "+55 11 94255 4417" },
        { nome: "VITÓRIA CARVALHO LOPES NERY", email: "vitoriacln_10@hotmail.com", telefone: "+55 11 94272 1057" },
        { nome: "ANNE CAROLINE SARAIVA", email: "annesaraivab@gmail.com", telefone: "+55 11 99238 9567" },
        { nome: "DANIEL ARAUJO PEREIRA", email: "eudanaraujo@gmail.com", telefone: "+55 73 99926 4429" },
        { nome: "JERUSA DUARTE LIMA", email: "jerusaduarte@hotmail.com", telefone: "+55 21 95948 3860" },
        { nome: "HENRIK BARROS", email: "henrikbarros@live.com", telefone: "+55 21 98563 5425" },
        { nome: "ITAMAR MARTINS", email: "itamartellesmartins@gmail.com", telefone: "+55 51 99524 4312" },
        { nome: "TÁBATA RAMOS DE ALMEIDA RODRIGUES COSTA", email: "tabataalrodrigues@gmail.com", telefone: "+55 11 96368 8702" },
        { nome: "LETÍCIA CAETANO SALES", email: "leticia.salles@idunamis.org", telefone: "+55 11 93225 3437" },
        { nome: "NATHAN NACCARATO SZWARCBERG", email: "nathan_naccarato@hotmail.com", telefone: "+55 11 98453 7771" },
        { nome: "LILIANE DÖRR WAGNER MARTINS", email: "00530314070", telefone: "+55 51 99666 3176" },
        { nome: "GUSTAVO HENRIQUE FREITAG", email: "gustavo.henrique.freitag", telefone: "+55 11 94017 0586" },
        { nome: "SOFIA VILACA", email: "sofiavilaca1210@gmail.com", telefone: "+55 19 98400 5050" },
        { nome: "ZION RECIFE", email: "MMAMPRIM@ZIONCHURCH.ORG.BR", telefone: "+55 11 98182 3734" },
        { nome: "STEFANY VAZ IAMASHITA", email: "stefanyv871@gmail.com", telefone: "+55 11 98997 0934" },
        { nome: "FELIPE COSTA DE OLIVEIRA", email: "felipe.costa.de.oliveira", telefone: "+55 21 99825 2431" },
      ];
      
    const leaders = await prisma.user.findMany({
      where: {
        OR: [{ whatsapp: null }, { whatsapp: "" }],
      },
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
      },
    });

    console.log(`🔍 ${leaders.length} líderes sem WhatsApp encontrados.`);

    function partialNameMatch(nameA: string, nameB: string): boolean {
        const partsA = normalizeString(nameA).split(" ");
        const partsB = normalizeString(nameB).split(" ");
        const intersection = partsA.filter(p => partsB.includes(p));
        return intersection.length >= 2;
      }

      
    let updatedCount = 0;
    let skippedCount = 0;
    let noMatchLeaders: typeof leaders = [];

    for (const leader of leaders) {
      const normalizedLeaderName = normalizeString(leader.name);
      const fixedEmail = fixEmail(leader.email || "");
      const match =
      leadersFromCSV.find(
        (csv) =>
          fixEmail(csv.email) === fixedEmail ||
          isSimilar(csv.email, fixedEmail)
      ) ||
      leadersFromCSV.find((csv) => isSimilar(csv.nome, leader.name)) ||
      leadersFromCSV.find((csv) => partialNameMatch(csv.nome, leader.name));
    
     
      if (match) {
        console.log("\n-----------------------------");
        console.log(`🎯 MATCH ENCONTRADO!`);
        console.log(`Banco de Dados: ${leader.name} (${leader.email})`);
        console.log(`CSV:            ${match.nome} (${match.email})`);
        console.log(`Telefone:       ${match.telefone}`);
        console.log("-----------------------------");

        const shouldUpdate = await askQuestion("Atualizar o WhatsApp? (y/n): ");

        if (shouldUpdate) {
          const normalizedPhone = normalizePhoneNumber(match.telefone);
          await prisma.user.update({
            where: { id: leader.id },
            data: { whatsapp: normalizedPhone },
          });
          console.log(`✅ Atualizado para: ${normalizedPhone}`);
          updatedCount++;
        } else {
          console.log("⏭️ Ignorado.");
          skippedCount++;
        }
      } else {
        noMatchLeaders.push(leader);
      }
    }

    console.log("\n=== RESUMO FINAL ===");
    console.log(`🔄 Atualizados: ${updatedCount}`);
    console.log(`⏭️ Ignorados: ${skippedCount}`);
    console.log(`❌ Sem correspondência: ${noMatchLeaders.length}`);

    if (noMatchLeaders.length > 0) {
      console.log("\n=== SEM CORRESPONDÊNCIA ===");
      noMatchLeaders.forEach((l, i) =>
        console.log(`${i + 1}. ${l.name} (${l.email})`)
      );
    }
  } catch (error) {
    console.error("Erro ao atualizar:", error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

updateLeadersWhatsapp();
