
import { PlayerStats, GameData } from '../types';

export const INITIAL_PLAYER_STATS: PlayerStats = {
  itibar: 50,
  partiGucu: 30,
  etik: 100,
  medya: 20,
  moral: 75,
};

export const API_KEY_ERROR_MESSAGE = "API Anahtarı bulunamadı. Lütfen .env dosyasında API_KEY değişkenini ayarlayın.";

export const scenes: GameData = {
  welcome: {
    id: 'welcome',
    title: "Oyuna Hoş Geldiniz",
    storyPromptSeed: "Türk Siyaset Macerası oyununa hoş geldiniz! Bu oyunda genç bir siyasetçi olarak kariyer basamaklarını tırmanmaya çalışacaksınız. Vereceğiniz kararlar kaderinizi belirleyecek. Başlamak için aşağıdaki butona tıklayın.",
    imgPrompt: "Abstract background representing political choices and strategy, with Turkish flag elements subtly integrated, hopeful and dramatic lighting.",
    choices: [
      { text: "Maceraya Başla!", next: "start", effects: "" }
    ],
    isGameStart: true,
  },
  start: {
    id: 'start',
    title: "Genç Seçimi",
    storyPromptSeed: "Bir üniversite öğrencisisin. Siyasi kariyer hayallerin var. Hangi yolu seçeceksin?",
    imgPrompt: "Ultra-realistic photo of a Turkish university campus courtyard at sunset, groups of politically active students distributing flyers, 35 mm DSLR, shallow depth of field, natural warm lighting.",
    choices: [
      {
        text: "İktidar Partisi Gençlik Kolları",
        next: "genclikiktidar",
        effects: "partiGucu+10"
      },
      {
        text: "Muhalefet Koalisyonu Gençlik Örgütü",
        next: "genclikmuhalefet",
        effects: "partiGucu+10"
      }
    ]
  },
  genclikiktidar: {
    id: 'genclikiktidar',
    title: "İktidar Partisi Gençlik Kolları",
    storyPromptSeed: "İktidar Partisi Gençlik Kolları'na katıldın. Parti içinde yükselmek için ilk görevlerin seni bekliyor. Çevren yeni parti arkadaşlarıyla dolu.",
    imgPrompt: "Young political activists at a ruling party meeting, enthusiastic and determined, modern office setting with party banners.",
    choices: [
      { text: "İlk görevime hazırım!", next: "afisKrizi", effects: "moral+5" }
    ]
  },
  genclikmuhalefet: {
    id: 'genclikmuhalefet',
    title: "Muhalefet Koalisyonu Gençlik Örgütü",
    storyPromptSeed: "Muhalefet Koalisyonu Gençlik Örgütü'ne katıldın. Değişim için mücadele etmeye kararlısın. Etrafın senin gibi düşünen gençlerle çevrili.",
    imgPrompt: "Young political activists at an opposition party rally, passionate and vocal, street setting with protest signs.",
    choices: [
      { text: "Mücadeleye başlayalım!", next: "afisKrizi", effects: "moral+5" }
    ]
  },
  afisKrizi: {
    id: 'afisKrizi',
    title: "Afiş Krizi",
    storyPromptSeed: "Gece afişleme faaliyeti sırasındasın. Aniden bir polis ekibi beliriyor ve kimlik kontrolü yapmak istiyorlar. Ne yapacaksın?",
    imgPrompt: "Nighttime street in Istanbul, students nervously gluing political posters under dim streetlights, police car with flashing blue-red lights approaching, cinematic realism, high ISO grain, tense atmosphere.",
    choices: [
        { text: "Kimliğini sakince göster.", next: "afisKrizi_sonuc_kimlik", effects: "itibar-5,etik+0" },
        { text: "Haklarını savun ve direniş göster.", next: "afisKrizi_sonuc_savun", effects: "medya+5,partiGucu-3,etik-5" }
    ]
  },
  afisKrizi_sonuc_kimlik: {
    id: 'afisKrizi_sonuc_kimlik',
    title: "Kimlik Kontrolü Sonucu",
    storyPromptSeed: "Polis kimliğini kontrol ettikten sonra kısa bir sorgulamanın ardından seni serbest bırakır. Olay parti içinde pek duyulmaz ama sen biraz tedirgin olursun.",
    imgPrompt: "Student activist looking relieved but thoughtful after a police identity check, dark alleyway background, subtle city lights.",
    choices: [
        { text: "Faaliyetlere devam et.", next: "sosyalMedyaFenomeni", effects: "moral-2" }
    ]
  },
  afisKrizi_sonuc_savun: {
    id: 'afisKrizi_sonuc_savun',
    title: "Hak Savunma Sonucu",
    storyPromptSeed: "Polise karşı haklarını savunman küçük bir arbedeye yol açar. Gözaltına alınmasan da olayın videosu sosyal medyada yayılır ve parti içinde hem destek hem de eleştiri alırsın. 'Tutanak riski' atlatılmıştır ama itibarın dalgalanır.",
    imgPrompt: "Social media interface showing a viral video of a student activist arguing with police, comments section visible, dramatic phone screen glow.",
    choices: [
        { text: "Bu durumu lehime çevirmeliyim.", next: "sosyalMedyaFenomeni", effects: "medya+10, itibar+5" }
    ]
  },
  sosyalMedyaFenomeni: {
    id: 'sosyalMedyaFenomeni',
    title: "Sosyal Medya Fenomeni",
    storyPromptSeed: "Partinin gündemdeki bir konusu hakkında viral bir tweet atma şansın var. Bu, popülariteni artırabilir ama riskleri de var.",
    imgPrompt: "Smartphone close-up, Turkish tweet going viral on screen, retweet and like animations, bright OLED glow reflecting on a young person's excited face, realistic, dark room background.",
    choices: [
        { text: "Cesur bir eleştiri tweet'i at.", next: "tweetSonuc", effects: "medya+15,partiGucu+0,etik+0,itibar+5" }, // OCR'da partiGucu ±0, etik +0 diyor
        { text: "Daha güvenli, genel bir mesaj at.", next: "tweetSonucGuvenli", effects: "medya+5,partiGucu+3,itibar+2" }
    ]
  },
  tweetSonuc: {
    id: 'tweetSonuc',
    title: "Tweet Etkisi",
    storyPromptSeed: "Attığın cesur tweet büyük yankı uyandırdı! Hem destekçilerin arttı hem de bazı kesimlerden tepki aldın. Medyadaki görünürlüğün tavan yaptı.",
    imgPrompt: "Split screen: one side shows positive news headlines about a young politician, other side shows critical comments on social media. Overall dynamic and impactful.",
    choices: [
        { text: "Sıradaki mücadeleye!", next: "ilceSecimi_baslangic", effects: "moral+10" }
    ]
  },
  tweetSonucGuvenli: {
    id: 'tweetSonucGuvenli',
    title: "Tweet Etkisi (Güvenli)",
    storyPromptSeed: "Attığın güvenli mesaj olumlu karşılandı ve partindeki konumunu biraz daha sağlamlaştırdı. Büyük bir sarsıntı yaratmadı ama istikrarlı bir ilerleme kaydettin.",
    imgPrompt: "Young politician smiling confidently in front of party banners, shaking hands with senior party members, positive and professional atmosphere.",
    choices: [
        { text: "İstikrarlı adımlarla devam.", next: "ilceSecimi_baslangic", effects: "moral+5" }
    ]
  },
   ilceSecimi_baslangic: {
    id: 'ilceSecimi_baslangic',
    title: "İlçe Siyaseti / Belediye Meclisi Seçimleri",
    storyPromptSeed: "Artık ilçe siyasetinde aktif rol alma ve belediye meclisi seçimlerine hazırlanma zamanı geldi. Bu yolda 5 önemli misyon seni bekliyor: broşür dağıtımı, bağış toplama, rakip partiyle TV paneli, fake-news saldırısıyla mücadele ve bir kriz anında (deprem yardımı gibi) halka yardım.",
    imgPrompt: "Busy local election campaign office, maps on the wall, volunteers working, stacks of brochures, determined young candidate at the center.",
    choices: [
      { text: "İlk misyona başla: Broşür Dağıtımı.", next: "ilceSecimi_brosur", effects: "" }
    ]
  },
  // Placeholder for game over
  gameOver_etikDusuk: {
    id: 'gameOver_etikDusuk',
    title: "Etik Çöküş",
    storyPromptSeed: "Verdiğin kararlar etik değerlerini aşındırdı. Halkın ve partinin gözünden düştün. Siyasi kariyerin burada sona erdi.",
    imgPrompt: "Desolate and empty political office, scattered papers, dim lighting, a sense of failure and regret.",
    choices: [
      { text: "Yeniden Başla", next: "welcome", effects: "" }
    ],
    isGameOver: true,
  },
   gameOver_hapis: {
    id: 'gameOver_hapis',
    title: "Hapse Girdin",
    storyPromptSeed: "Yolsuzluklar ve etik dışı davranışların sonucunda adalet önüne çıkarıldın ve hapse girdin. Siyasi kariyerin utanç verici bir şekilde sonlandı.",
    imgPrompt: "Silhouette of a figure behind prison bars, looking out at a faint light, symbolizing loss of freedom and hope.",
    choices: [
      { text: "Yeniden Başla", next: "welcome", effects: "" }
    ],
    isGameOver: true,
  }
  // More scenes can be added here based on the OCR data.
};
