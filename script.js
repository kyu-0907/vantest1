// [DEBUG] script.js 로드 확인
console.log("VAN: script.js loaded");

// Supabase Initialization
var SUPABASE_URL = 'https://skjhxxmtusiztybytznd.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNramh4eG10dXNpenR5Ynl0em5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMzM5MzcsImV4cCI6MjA4NzgwOTkzN30.LS0wHpEAQZLOwkjvR8hF8BkWbYWPescJC0peMr4R9zs';
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

var currentUserNickname = ''; // 유저 닉네임 저장용

// Three.js 전역 싱글톤 변수
let scene, camera, renderer, controls, currentModel;
const viewerContainer = document.getElementById('item-3d-viewer');

// DOM Elements
const introScreen = document.getElementById('intro-screen');
const screen1 = document.getElementById('screen1');
const videoScreen = document.getElementById('video-screen');
const screen2 = document.getElementById('screen2');
const videoScreen2 = document.getElementById('video-screen2');
const screen3 = document.getElementById('screen3');
const video = document.getElementById('main-video');
const secondVideo = document.getElementById('second-video');
const typingText = document.getElementById('typing-text');
const submitBtn = document.getElementById('submit-btn');
const imacLogin = document.getElementById('imac-login');
const imacProducts = document.getElementById('imac-products');
const imacAuctionRoom = document.getElementById('imac-auction-room');
const productList = document.querySelector('.product-list');
const closeAuctionBtn = document.getElementById('close-auction-btn');
const startBidBtn = document.getElementById('start-bid-btn');

// Narrative Elements
const imacNarrative = document.getElementById('imac-narrative');
const checkNarrativeBtn = document.getElementById('check-narrative-btn');
const narrativeBackBtn = document.getElementById('narrative-back-btn');

// Bidding Game Elements
const imacBiddingGame = document.getElementById('imac-bidding-game');
const gameTimerDisplay = document.getElementById('game-timer');
const gamePriceSlider = document.getElementById('game-price-slider');
const gameCurrentValue = document.getElementById('game-current-value');
const gameResultOverlay = document.getElementById('game-result-overlay');
const gameViewerContainer = document.getElementById('game-3d-viewer');

let gameTimerInterval;
let toastInterval;
let timeLeft = 60;
let currentGameIndex = 0;
let gameScene, gameCamera, gameRenderer, gameControls, gameModel;

// Narrative Scene
let narrScene, narrCamera, narrRenderer, narrControls, narrModel;
let narrSideRenderers = []; // { renderer, scene, camera, container }

const textToType = "start_AUCTION";
let charIndex = 0;

const productData = [
    { target: 1800, name: "Atomizer", year: "c. 2019, late 2010s", condition: "Good / Height: 92mm Width: 28mm", material: "Aluminum, Glass", desc: "정전이 발생한 Paris Fashion Week S/S 2019, 47th Show의 밤, 백스테이지 인접 개인 숙소에서 발견된 아토마이저다. 무대에 오르기 직전 해당 모델이 이 향수를 단 한 차례 분사했다는 기록이 남아 있다. 그날 이후 모델의 계약은 순차적으로 종료되었으며, 그는 공식 석상에 다시 나타나지 않았다. 정전과 제품 사이의 직접적 인과관계는 확인되지 않았으나, 업계 내부에서는 해당 시즌을 전환점으로 언급한다.", price: "1,800" },
    { target: 180096, name: "Spoon", year: "c. 19th century, record referenced 1976", condition: "Excellent / Height: 186mm Width: 38mm", material: "Sterling Silver 92.5%", desc: "1976년 5월 14일, 영국 요크셔 지역 귀족 가문 House of Ashford의 마지막 상속자는 이 수저로 식사를 마친 직후 모든 재산을 포기했다는 기록이 남아 있다. 공식 문서에는 자발적 포기로 기재되어 있으나, 당시 저택은 곧 봉쇄되었고 가문 명의 자산은 분산 처리되었다. 본 수저는 이후 회수되어 감정에 부쳐졌다. 특이점은, 사용 흔적이 19세기 후반 이후 더 이상 누적되지 않았다는 점이다. 가문의 계승은 1976년에 종료되었으나, 물리적 사용 기록은 143년 전에서 멈춰 있다.", price: "180,096" },
    { target: 68076, name: "Vase", year: "c. 2019", condition: "Pristine / Height: 310mm Width: 145mm", material: "18K Gold", desc: "2019년 5월 18일, 신원이 확인되지 않은 기증자가 남긴 금제(金製) 꽃병. 기증자는 단 하나의 조건을 요구했다. “꽃은 반드시 시든 상태로 전시할 것.” 그 이유에 대해서는 어떠한 설명도 제공하지 않았다. 이후 본 꽃병은 조건에 따라 전시되었으며, 전시 기간 동안 시든 꽃은 교체되지 않았으나 물은 매일 새로 갈아진 것으로 기록되어 있다. 생명력이 소진된 꽃과 지속적으로 보존되는 물의 대비는 의도된 연출인지 여부가 확인되지 않았다. 기증자는 추가 연락을 남기지 않았다.", price: "68,076" },
    { target: 13400, name: "Wine Glass", year: "c. late 2000s, Global Financial Crisis period", condition: "Crystal Clear / Height: 214mm Width: 82mm", material: "Lead-free Crystal", desc: "글로벌 금융위기로 시장 변동성이 극대화되던 시기, 한 스타트업 인수 계약 체결 직후 사용된 와인잔이다. 건배는 예정대로 진행되었으며, 참석자 전원이 잔을 들어 계약 성사를 축하했다. 기록에 따르면 건배 종료 후 약 3분이 지난 시점, 해당 잔은 테이블 위에서 자발적 균열이 발생한 상태로 발견되었다. 현장 보고서에는 외부 충격, 낙하, 온도 급변 등 물리적 원인이 확인되지 않았다고 기재되어 있다. 그날 밤, 인수 계약은 전면 재검토에 들어갔고 최종적으로 파기되었다. 균열과 계약 철회 사이의 인과관계는 입증되지 않았다.", price: "13,400" },
    { target: 834090, name: "Lamp", year: "Undated", condition: "Antique / Height: 340mm Width: 120mm", material: "Brass,Patina", desc: "유물을 모으던 한 수집가는 이 램프를 유리 케이스 안에 봉인했다. 그는 여러 차례 “소원을 빌지 않았다”고 밝혔다. 소원이 이루어지는 순간 따라올지 모를 후환을 감당할 자신이 없었기 때문이다. 결국 그는 램프를 한 번도 문지르지 않은 채, 익명으로 기증했다.", price: "834,090" },
    { target: 13400, name: "Liquor Bottle", year: "Undated", condition: "-- / Height: Width:", material: "no info", desc: "서사 정보 확인불가", price: "13,400" },
    { target: 13400, name: "Reliquary", year: "late medieval style", condition: "Historic Residue / Height: 240mm Width: 110mm", material: "Silver 88%~92%, Oak Wood", desc: "동일한 형태의 사리함이 두 점 존재하는 것으로 확인된다. 한 점은 성지 내 제단에 안치되어 있으며, 다른 한 점은 개인 수집가의 금고에 보관되어 있다. 두 물품의 제작 연대와 이동 경로는 일부 기록으로만 전해질 뿐, 어느 쪽이 원본인지에 대해서는 합의가 이루어지지 않았다. 종교 단체는 성지 보관본을 정본으로 간주하나, 사적 감정 보고서는 수집가 소장본의 금속 산화 패턴이 더 오래되었을 가능성을 제기한다. 그럼에도 신도들은 두 장소를 모두 순례하며, 두 사리함 모두에 동일한 기도를 올린다. 진위는 불명확하나, 신앙의 흐름은 분리되지 않았다.", price: "13,400" },
    { target: 13400, name: "Kuksa", year: "early-mid 20th century, North Sámi region", condition: "Handcrafted / Height: 158mm Width: 92mm", material: "Birch burl", desc: "노르웨이 핀마르크(Finnmark) 지역의 North Sámi 장인이 제작했다고 전해지는 kuksa다. 자작나무 혹(birch burl)을 통째로 파내어 만들었으며, 손잡이에는 순록 문양이 수공으로 새겨져 있다. 지역 전승에 따르면 kuksa는 스스로 구매하는 물건이 아니며, 반드시 누군가로부터 선물로 받아야 ‘길을 잃지 않는다’고 전해진다. 본 개체의 제작자 이름은 기록에 남아 있지 않으나, 하단부에는 전통 방식의 절삭 흔적이 확인된다. 이전 소장 이력은 구전으로만 전해지며, 최초 전달 경로는 특정되지 않았다.", price: "13,400" },
    { target: 13400, name: "Addictive substance", year: "mid-late 20th century", condition: "Unstable / Height: 74mm Width: 22mm", material: "Sealed glass vial", desc: "국경 긴장이 고조되던 시기, 본 약물은 군 의료 체계 내에서 제한적으로 사용이 허가되었다. 공식 문서에는 “통증 완화 및 전투 지속력 보조 목적”으로 기재되어 있으며, 사용 범위는 지정 의료 인력 감독 하에 한정되었다. 협정 체결 이후 정책은 즉시 수정되었고, 해당 물질은 위험 등급으로 재분류되었다. 일부 문건은 폐기되었으며, 남은 기록은 행정 요약본에 불과하다. 현재 확인 가능한 자료에는 물질의 정확한 배합 비율과 장기적 영향에 대한 기술이 누락되어 있다. 인과관계는 명시되지 않았으나, 사용 중단 시점과 정책 변경 시점은 일치한다.", price: "13,400" },
    { target: 12000, name: "The Nameless", year: "Future Prospect", condition: "Evaluation Pending", material: "Variable Matter", desc: "당신이 이름을 붙여주기를 기다리는 마지막 오브제입니다. 무한한 가능성을 품고 VAN의 수집실 한구석을 지키고 있습니다.", price: "??,???" }
];

// --- Flow Control ---

// 첫 클릭 시, 화면 덜컹거림(screen1) 없이 바로 영상(videoScreen)으로 전환
introScreen.addEventListener('click', () => {
    introScreen.classList.remove('active');

    // screen1(첫 번째 이미지)는 거치지 않고 바로 영상 재생
    if (screen1.classList.contains('active')) {
        screen1.classList.remove('active');
    }

    videoScreen.classList.add('active');

    // 브라우저 정책(Autoplay) 우회 및 자연스러운 영상 재생
    const playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise.catch((error) => {
            console.log("Video play prevented:", error);
            // 만약 브라우저가 막는다면 사용자가 한 번 더 클릭하도록 유도 가능하나,
            // 이미 사용자 동작(클릭)으로 트리거되었으므로 대부분 정상 작동합니다.
        });
    }
});

// 기존 screen1 단독 클릭 이벤트는 삭제 또는 비활성화 처리
screen1.addEventListener('click', () => {
    screen1.classList.remove('active');
    videoScreen.classList.add('active');
    video.play();
});

video.onended = goToScreen2;
videoScreen.addEventListener('click', () => {
    video.pause();
    goToScreen2();
});

function goToScreen2() {
    videoScreen.classList.remove('active');
    screen2.classList.add('active');
    setTimeout(startTyping, 500);
}

function startTyping() {
    if (charIndex < textToType.length) {
        typingText.textContent += textToType.charAt(charIndex);
        charIndex++;
        setTimeout(startTyping, 150);
    }
}

typingText.addEventListener('click', () => {
    if (charIndex >= textToType.length) {
        screen2.classList.remove('active');
        videoScreen2.classList.add('active');
        secondVideo.play();
    }
});

videoScreen2.addEventListener('click', goToScreen3);
secondVideo.onended = goToScreen3;

function goToScreen3() {
    secondVideo.pause();
    videoScreen2.classList.remove('active');
    screen3.classList.add('active');
    const imacOverlay = document.querySelector('.imac-overlay');
    function onImacClick() {
        screen3.classList.add('zoomed');
        imacOverlay.classList.add('zoomed');
        imacOverlay.removeEventListener('click', onImacClick);
    }
    imacOverlay.addEventListener('click', onImacClick);
}

submitBtn.addEventListener('click', () => {
    const name = document.getElementById('username-input').value;
    if (name) {
        currentUserNickname = name; // 글로벌 변수에 저장
        imacLogin.classList.remove('active');
        imacProducts.classList.add('active');
        generateProducts();
    } else {
        alert('이름을 입력해주세요.');
    }
});

function generateProducts() {
    productList.innerHTML = '';
    for (let i = 1; i <= 10; i++) productList.appendChild(createProductCard(i));
    for (let j = 0; j < 2; j++) {
        for (let i = 1; i <= 10; i++) productList.appendChild(createProductCard(i));
    }
    initAutoScroll();
}

function createProductCard(i) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-img-placeholder">
            <img src="obj${i}.svg" alt="Product" class="product-icon">
        </div>
        <div class="product-info">
            <div class="product-name">code.${i.toString().padStart(2, '0')} ${productData[i - 1].name}</div>
        </div>
    `;
    card.addEventListener('click', () => openAuctionRoom(i));
    return card;
}

let autoScrollId;
function initAutoScroll() {
    if (autoScrollId) cancelAnimationFrame(autoScrollId);
    const slider = document.querySelector('.products-slider');
    let scrollPos = 0;
    let isInteracting = false;

    // 마우스나 터치 시 일시정지
    slider.addEventListener('mouseenter', () => isInteracting = true);
    slider.addEventListener('mouseleave', () => {
        isInteracting = false;
        scrollPos = slider.scrollLeft; // 뗀 지점부터 다시 시작
    });
    slider.addEventListener('mousedown', () => isInteracting = true);
    window.addEventListener('mouseup', () => {
        if (imacProducts.classList.contains('active')) {
            isInteracting = false;
            scrollPos = slider.scrollLeft;
        }
    });
    slider.addEventListener('touchstart', () => isInteracting = true);
    slider.addEventListener('touchend', () => {
        isInteracting = false;
        scrollPos = slider.scrollLeft;
    });

    function scroll() {
        if (imacProducts.classList.contains('active') && !isInteracting) {
            scrollPos += 0.8;
            slider.scrollLeft = scrollPos;

            const firstCard = productList.querySelector('.product-card');
            if (firstCard) {
                const setWidth = (firstCard.offsetWidth + 20) * 10;
                if (scrollPos >= setWidth) {
                    scrollPos = 0;
                    slider.scrollLeft = 0;
                }
            }
        }
        autoScrollId = requestAnimationFrame(scroll);
    }
    scroll();
}

// --- Three.js Stable Implementation (Singleton) ---

function initThreeJS() {
    try {
        const viewer = document.getElementById('item-3d-viewer');
        if (!viewer) return;

        // 씬 생성/초기화
        if (!scene) {
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x111111);

            // 조명 (고정)
            const ambient = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambient);
            const directional = new THREE.DirectionalLight(0xffffff, 1.0);
            directional.position.set(5, 5, 5);
            scene.add(directional);
        } else {
            // 기존 씬 객체 정리
            if (currentModel) {
                scene.remove(currentModel);
                disposeObject(currentModel);
                currentModel = null;
            }
        }

        const rect = viewer.getBoundingClientRect();

        // [품질 최적화] 선명한 화질과 안정성의 균형
        if (!renderer) {
            renderer = new THREE.WebGLRenderer({
                antialias: true, // 테두리 매끄럽게
                alpha: false,
                powerPreference: 'high-performance'
            });
            renderer.setPixelRatio(window.devicePixelRatio); // 모니터 해상도에 맞춤
            renderer.setSize(rect.width, rect.height);
            viewer.appendChild(renderer.domElement);
        } else {
            renderer.setSize(rect.width, rect.height);
            if (!viewer.contains(renderer.domElement)) {
                viewer.appendChild(renderer.domElement);
            }
        }

        // 카메라 설정
        if (!camera) {
            camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 1000);
            camera.position.set(2, 2, 5);
        } else {
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
        }

        // 컨트롤 설정
        if (!controls) {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true; // 관성 효과 추가
            controls.dampingFactor = 0.05;
            controls.autoRotate = true; // 자동 회전 활성화
            controls.autoRotateSpeed = 2.0; // 회전 속도 설정
        }

        animate();
    } catch (e) {
        console.error("Safe-Mode Context Error:", e);
        alert("3D 엔진 안전 모드 기동 실패: " + e.message + "\n브라우저의 하드웨어 가속 설정을 확인해 보세요.");
    }
}

function animate() {
    if (!renderer) return;
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
}

function disposeObject(obj) {
    if (!obj) return;
    obj.traverse((child) => {
        if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
    });
}

function openAuctionRoom(index) {
    currentGameIndex = index;
    const data = productData[index - 1];

    imacProducts.classList.remove('active');
    imacAuctionRoom.classList.add('active');

    document.getElementById('auction-room-title').textContent = `AUCTION ROOM #${400 + index}`;

    // 상품 이름과 세부 사항 업데이트
    document.getElementById('auction-item-name').textContent = data.name;
    document.getElementById('auction-item-index').textContent = index.toString().padStart(2, '0');
    document.getElementById('item-year').textContent = data.year;
    document.getElementById('item-material').textContent = data.material;
    document.getElementById('item-condition').textContent = data.condition;
    document.getElementById('artifact-description').textContent = data.desc;

    // Supabase 랭킹 목록 업데이트 호출
    updateAuctionRoomRankings(index);

    setTimeout(() => {
        initThreeJS();
        const ext = (index === 5) ? 'glb' : 'obj';
        loadModel(`obj${index}.${ext}`, ext);
    }, 100);
}

// 옥션룸 우측 라이브 랭킹 업데이트
async function updateAuctionRoomRankings(index) {
    const biddingList = document.querySelector('.auction-right .bidding-list');
    biddingList.innerHTML = '<div class="bidding-item"><span class="bid-rank">로딩 중...</span></div>';

    try {
        const { data, error } = await supabase
            .from('rankings')
            .select('*')
            .eq('object_index', index)
            .order('accuracy', { ascending: false })
            .order('created_at', { ascending: true })
            .limit(10);

        if (error) throw error;

        biddingList.innerHTML = '';
        if (data.length === 0) {
            biddingList.innerHTML = '<div class="bidding-item"><span class="bid-rank">아직 입찰 기록이 없습니다.</span></div>';
            return;
        }

        data.forEach((rank, i) => {
            const isTop = i === 0;
            const itemClass = isTop ? 'bidding-item' : 'bidding-item sub';
            const priceClass = isTop ? 'bid-price' : 'bid-price sub';
            biddingList.innerHTML += `
                <div class="${itemClass}">
                    <span class="bid-rank">${i + 1}. ${rank.nickname}</span>
                    <span class="${priceClass}">${rank.price.toLocaleString()} DZC</span>
                </div>
            `;
        });
    } catch (e) {
        console.error("Ranking fetch error:", e);
        biddingList.innerHTML = '<div class="bidding-item"><span class="bid-rank">순위를 불러오는데 실패했습니다.</span></div>';
    }
}

function loadModel(fileName, type) {
    const safePath = `./${fileName}`;
    console.log("Loading Asset (Safe Path):", safePath);

    const loader = (type === 'glb') ? new THREE.GLTFLoader() : new THREE.OBJLoader();

    loader.load(safePath, (result) => {
        if (currentModel) scene.remove(currentModel);

        const object = (type === 'glb') ? result.scene : result;

        // 메테리얼 최적화 (가시성 확보)
        object.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshPhongMaterial({
                    color: 0xcccccc,
                    specular: 0x111111,
                    shininess: 30,
                    side: THREE.DoubleSide
                });
            }
        });

        currentModel = object;
        scene.add(object);

        // [크기 표준화] 어떤 모델이든 일정한 크기로 정규화
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 3.5; // 화면에 꽉 차는 표준 크기
        const scaleFactor = targetSize / (maxDim || 1);

        object.scale.setScalar(scaleFactor);

        // 모델 중앙 배치 (스케일 적용 후)
        object.position.copy(center).multiplyScalar(-scaleFactor);

        // 카메라 거리 고정으로 모든 모델이 동일하게 보이도록 함
        camera.position.set(2, 2, 8);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();

    }, null, (err) => {
        console.error("Model Load Error:", err);
        alert("모델을 불러올 수 없습니다: " + fileName + "\n파일 경로가 올바른지 확인해주세요.");
    });
}

// --- Bidding Game Three.js (Separate Context - Also Singleton) ---

function initGameThreeJS() {
    const viewer = document.getElementById('game-3d-viewer');
    if (!viewer) return;

    if (!gameScene) {
        gameScene = new THREE.Scene();
        gameScene.background = new THREE.Color(0x000000);
        const ambient = new THREE.AmbientLight(0xffffff, 1.0);
        gameScene.add(ambient);
    } else {
        if (gameModel) { gameScene.remove(gameModel); disposeObject(gameModel); gameModel = null; }
    }

    const rect = viewer.getBoundingClientRect();
    if (!gameRenderer) {
        gameRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        gameRenderer.setSize(rect.width, rect.height);
        viewer.appendChild(gameRenderer.domElement);
    } else {
        gameRenderer.setSize(rect.width, rect.height);
        if (!viewer.contains(gameRenderer.domElement)) viewer.appendChild(gameRenderer.domElement);
    }

    if (!gameCamera) {
        gameCamera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 1000);
        gameCamera.position.set(0, 0, 10);
    }

    if (!gameControls) {
        gameControls = new THREE.OrbitControls(gameCamera, gameRenderer.domElement);
        gameControls.enableDamping = true;
        gameControls.autoRotate = true;
        gameControls.autoRotateSpeed = 2.0;
    }

    function gameAnimate() {
        if (!gameRenderer) return;
        requestAnimationFrame(gameAnimate);
        gameControls.update();
        gameRenderer.render(gameScene, gameCamera);
    }
    gameAnimate();
}

function loadGameModel(fileName, type) {
    const loader = (type === 'glb') ? new THREE.GLTFLoader() : new THREE.OBJLoader();
    loader.load(fileName, (result) => {
        if (gameModel) gameScene.remove(gameModel);
        const object = (type === 'glb') ? result.scene : result;
        object.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshPhongMaterial({
                    color: 0xfafafa,
                    specular: 0xffffff,
                    shininess: 100,
                    side: THREE.DoubleSide
                });
            }
        });
        gameModel = object;
        gameScene.add(object);

        // [게임 모델 표준화]
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        const targetSize = 4.0;
        const scaleFactor = targetSize / (maxDim || 1);

        object.scale.setScalar(scaleFactor);
        object.position.copy(center).multiplyScalar(-scaleFactor);

        gameCamera.position.set(0, 0, 10);
        gameCamera.lookAt(0, 0, 0);
    });
}

// Bidding Logic
closeAuctionBtn.addEventListener('click', () => {
    imacAuctionRoom.classList.remove('active');
    imacProducts.classList.add('active');
});

startBidBtn.addEventListener('click', () => {
    imacAuctionRoom.classList.remove('active');
    imacBiddingGame.classList.add('active');
    startBiddingGame(currentGameIndex);
});

// Narrative Logic
checkNarrativeBtn.addEventListener('click', () => {
    imacAuctionRoom.classList.remove('active');
    imacNarrative.classList.add('active');
    openNarrativeScreen(currentGameIndex);
});

narrativeBackBtn.addEventListener('click', () => {
    imacNarrative.classList.remove('active');
    imacAuctionRoom.classList.add('active');
});

function openNarrativeScreen(index) {
    const data = productData[index - 1];
    document.getElementById('narrative-title').textContent = data.name;
    document.getElementById('narrative-description').textContent = data.desc;
    document.getElementById('narrative-price-van1').textContent = `${data.price} DZC`;

    imacNarrative.classList.add('active'); // 서사 화면 활성화

    setTimeout(() => {
        initNarrativeThreeJS(index);
        updateNarrativeSidebars(index);
    }, 100);
}

function initNarrativeThreeJS(index) {
    const mainViewer = document.getElementById('narrative-central-viewer');
    if (!mainViewer) return;

    // --- 메인 모델 설정 ---
    if (!narrScene) {
        narrScene = new THREE.Scene();
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        narrScene.add(ambient);
        const directional = new THREE.DirectionalLight(0xffffff, 1.0);
        directional.position.set(5, 5, 5);
        narrScene.add(directional);
    } else {
        if (narrModel) { narrScene.remove(narrModel); disposeObject(narrModel); narrModel = null; }
    }

    const rect = mainViewer.getBoundingClientRect();
    if (!narrRenderer) {
        narrRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        narrRenderer.setSize(rect.width, rect.height);
        mainViewer.appendChild(narrRenderer.domElement);
    } else {
        narrRenderer.setSize(rect.width, rect.height);
        if (!mainViewer.contains(narrRenderer.domElement)) mainViewer.appendChild(narrRenderer.domElement);
    }

    if (!narrCamera) {
        narrCamera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 1000);
        narrCamera.position.set(2, 2, 8); // 옥션 룸과 유사한 각도
    } else {
        narrCamera.aspect = rect.width / rect.height;
        narrCamera.updateProjectionMatrix();
    }

    if (!narrControls) {
        narrControls = new THREE.OrbitControls(narrCamera, narrRenderer.domElement);
        narrControls.enableDamping = true;
        narrControls.autoRotate = true;
        narrControls.autoRotateSpeed = 2.0;
    }

    const ext = (index === 5) ? 'glb' : 'obj';
    const loader = (ext === 'glb') ? new THREE.GLTFLoader() : new THREE.OBJLoader();

    loader.load(`./obj${index}.${ext}`, (result) => {
        const object = (ext === 'glb') ? result.scene : result;
        object.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    specular: 0x111111,
                    shininess: 30,
                    side: THREE.DoubleSide
                });
            }
        });
        narrModel = object;

        // [정밀 중앙 배치] 옥션 룸 로직과 동일
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.5 / (maxDim || 1);

        object.scale.setScalar(scale);
        // 피봇이 어디든 상관없이 기하학적 중심을 (0,0,0)에 배치
        object.position.copy(center).multiplyScalar(-scale);

        narrScene.add(object);
        narrCamera.lookAt(0, 0, 0);
    });

    function narrAnimate() {
        if (!narrRenderer) return;
        requestAnimationFrame(narrAnimate);
        if (narrControls) narrControls.update();
        narrRenderer.render(narrScene, narrCamera);
    }
    narrAnimate();
}

function updateNarrativeSidebars(index) {
    const leftSide = document.getElementById('narrative-sidebar-left');
    const rightSide = document.getElementById('narrative-sidebar-right');
    if (!leftSide || !rightSide) return;

    const svgPath = `obj${index}.svg`;
    const iconsCount = 10;

    let iconsHtml = '<div class="narrative-scroll-content">';
    for (let i = 0; i < iconsCount; i++) {
        iconsHtml += `<img src="${svgPath}" class="narrative-sidebar-obj" alt="icon">`;
    }
    // 루프를 위한 복제
    for (let i = 0; i < iconsCount; i++) {
        iconsHtml += `<img src="${svgPath}" class="narrative-sidebar-obj" alt="icon">`;
    }
    iconsHtml += '</div>';

    leftSide.innerHTML = iconsHtml;
    rightSide.innerHTML = iconsHtml;
}

async function startToastNotifications(index) {
    clearInterval(toastInterval);
    const containerLeft = document.getElementById('game-toast-container-left');
    const containerRight = document.getElementById('game-toast-container-right');
    if (!containerLeft || !containerRight) return;

    containerLeft.innerHTML = '';
    containerRight.innerHTML = '';

    try {
        // 현재 아이템에 대한 과거 랭킹 데이터를 무작위로 가져오기 (가장 최근 데이터 위주)
        const { data, error } = await supabase
            .from('rankings')
            .select('nickname, price')
            .eq('object_index', index)
            .order('created_at', { ascending: false })
            .limit(30);

        if (error || !data || data.length === 0) return;

        // 데이터를 무작위로 섞음
        const shuffledData = data.sort(() => 0.5 - Math.random());
        let msgIndex = 0;
        let isLeftTurn = true; // 좌우 번갈아 나오도록 하는 플래그

        // 2초 ~ 4초 사이 랜덤한 주기로 토스트 발생
        function showNextToast() {
            if (msgIndex >= shuffledData.length) msgIndex = 0; // 반복

            const record = shuffledData[msgIndex++];
            const toast = document.createElement('div');
            toast.className = 'game-toast';

            // 텍스트 양식 통일
            toast.innerHTML = `<span>${record.nickname}님은 <span class="toast-price">${record.price.toLocaleString()}.00 DZC</span>로 감정했습니다.</span>`;

            const targetContainer = isLeftTurn ? containerLeft : containerRight;
            targetContainer.appendChild(toast);

            // 다음 턴 방향 전환
            isLeftTurn = !isLeftTurn;

            // 약간의 딜레이 후 show 클래스 추가 (애니메이션)
            setTimeout(() => {
                toast.classList.add('show');
            }, 50);

            // 일정 시간 후 사라짐
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 500); // 부드러운 애니메이션 시간 후 DOM에서 제거
            }, 4000);

            // 다음 토스트 예약 (2초 ~ 4초 간격)
            const nextDelay = Math.random() * 2000 + 2000;
            toastInterval = setTimeout(showNextToast, nextDelay);
        }

        // 첫 번째 토스트는 2초 후 띄우기
        toastInterval = setTimeout(showNextToast, 2000);

    } catch (e) {
        console.error("Toast fetch error:", e);
    }
}

function startBiddingGame(index) {
    currentGameIndex = index;
    const data = productData[index - 1];
    document.getElementById('game-item-name').textContent = data.name;

    // 타겟값이 항상 스크롤바 정중앙(50%)에 오면 유저가 정답을 유추할 수 있으므로
    // 오브제 번호(index)에 따라 1.4배 ~ 2.6배율로 불규칙하게 최대 범위를 산정합니다.
    const randomMultiplier = 1.4 + ((index * 7) % 13) * 0.1;
    const rawMax = data.target * randomMultiplier;

    // 타겟값에 맞춰 슬라이더 최대치를 유동적으로 설정 (적어도 15,000 DZC 이상은 되도록)
    const maxSliderValue = Math.max(15000, Math.ceil(rawMax / 5000) * 5000);
    gamePriceSlider.max = maxSliderValue;

    // 라벨 텍스트도 동적으로 변경
    const sliderLabels = document.querySelectorAll('.slider-labels span');
    if (sliderLabels.length >= 2) {
        sliderLabels[1].textContent = maxSliderValue.toLocaleString() + ".00";
    }

    gamePriceSlider.value = 0;
    gameCurrentValue.textContent = "0";
    gameResultOverlay.style.display = 'none';
    timeLeft = 60;
    clearInterval(gameTimerInterval);
    gameTimerInterval = setInterval(() => {
        timeLeft--;
        const min = Math.floor(timeLeft / 60);
        const sec = timeLeft % 60;
        gameTimerDisplay.textContent = `${min.toString().padStart(2, '0')} : ${sec.toString().padStart(2, '0')}`;
        if (timeLeft <= 0) endGame("TIME UP!");
    }, 1000);

    setTimeout(() => {
        initGameThreeJS();
        const ext = (index === 5) ? 'glb' : 'obj';
        loadGameModel(`obj${index}.${ext}`, ext);
    }, 100);

    // 토스트 알림 시작
    startToastNotifications(index);
}

gamePriceSlider.addEventListener('input', () => {
    gameCurrentValue.textContent = parseInt(gamePriceSlider.value).toLocaleString();
});

// 리셋 버튼 기능 추가
document.getElementById('game-reset-btn').addEventListener('click', () => {
    gamePriceSlider.value = 0;
    gameCurrentValue.textContent = "0";
});

document.getElementById('game-submit-btn').addEventListener('click', () => endGame("SUBMITTED!"));

async function endGame(status) {
    clearInterval(gameTimerInterval);
    clearInterval(toastInterval);
    const userVal = parseInt(gamePriceSlider.value);
    const targetVal = productData[currentGameIndex - 1].target;

    // 타겟값 대비 슬라이더의 최대 가능 범위를 고려해 최대 오차 산출
    const maxSliderVal = parseInt(gamePriceSlider.max);
    const maxDiff = Math.max(targetVal, maxSliderVal - targetVal);

    // 현재 오차
    const diff = Math.abs(targetVal - userVal);

    // 0.0%가 나오지 않도록 기본 점수 부여 (최소 1.5%)
    const minAccuracy = 1.5;

    // 완전히 틀렸을 때(= 최대오차) 1.5%, 정답일 때 100%가 나오도록 선형(Linear) 비례식 적용
    const calculatedAccuracy = minAccuracy + ((1 - (diff / maxDiff)) * (100 - minAccuracy));
    const accuracy = Math.max(minAccuracy, calculatedAccuracy); // 확실한 하한선 적용

    document.getElementById('result-status').textContent = status;
    document.getElementById('game-result-text').innerHTML = `정확도: ${accuracy.toFixed(1)}% (IEAA: ${targetVal.toLocaleString()} DZC)<br><span style="font-size: 0.8em; margin-top: 5px; display: inline-block;">(기록 저장 중...)</span>`;
    gameResultOverlay.style.display = 'flex';

    try {
        await supabase.from('rankings').insert([
            {
                nickname: currentUserNickname || "익명",
                object_index: currentGameIndex,
                price: userVal,
                target_price: targetVal,
                accuracy: accuracy
            }
        ]);
        document.getElementById('game-result-text').innerHTML = `정확도: ${accuracy.toFixed(1)}% (IEAA: ${targetVal.toLocaleString()} DZC)<br><span style="font-size: 0.8em; color: #4CAF50; margin-top: 5px; display: inline-block;">(기록 저장 완료)</span>`;
    } catch (e) {
        console.error("Save rank error:", e);
        document.getElementById('game-result-text').innerHTML = `정확도: ${accuracy.toFixed(1)}% (IEAA: ${targetVal.toLocaleString()} DZC)<br><span style="font-size: 0.8em; color: #f44336; margin-top: 5px; display: inline-block;">(기록 저장 실패)</span>`;
    }
}

const checkRankBtn = document.getElementById('check-rank-btn');
if (checkRankBtn) {
    checkRankBtn.addEventListener('click', () => {
        gameResultOverlay.style.display = 'none';
        imacBiddingGame.classList.remove('active');
        document.getElementById('imac-ranking').classList.add('active');
        updateRankingSidebars();
        loadFinalRankings(currentGameIndex);
    });
}

// 최종 랭킹 불러오기
async function loadFinalRankings(index) {
    const rankingBody = document.querySelector('.ranking-scroll-body');
    if (!rankingBody) return;

    rankingBody.innerHTML = '<div class="ranking-row main-rank"><span class="rank-name">랭킹 데이터 로딩 중...</span></div>';

    try {
        const { data, error } = await supabase
            .from('rankings')
            .select('*')
            .eq('object_index', index)
            .order('accuracy', { ascending: false })
            .order('created_at', { ascending: true })
            .limit(20);

        if (error) throw error;

        rankingBody.innerHTML = '';
        if (data.length === 0) {
            rankingBody.innerHTML = '<div class="ranking-row sub-rank"><span class="rank-name">아직 입찰 기록이 없습니다.</span></div>';
            return;
        }

        data.forEach((rank, i) => {
            const rowClass = i === 0 ? 'ranking-row main-rank' : 'ranking-row sub-rank';
            rankingBody.innerHTML += `
                <div class="${rowClass}">
                    <span class="rank-name">${i + 1}순위 ${rank.nickname}</span>
                    <span class="rank-value">${rank.price.toLocaleString()} DZC (${rank.accuracy.toFixed(1)}%)</span>
                </div>
            `;
        });
    } catch (e) {
        console.error("Ranking fetch error:", e);
        rankingBody.innerHTML = '<div class="ranking-row sub-rank"><span class="rank-name">순위를 불러오는데 실패했습니다.</span></div>';
    }
}

function updateRankingSidebars() {
    const leftSide = document.getElementById('ranking-sidebar-left');
    const rightSide = document.getElementById('ranking-sidebar-right');
    if (!leftSide || !rightSide) return;

    // 좌측: 1-5번 오브제
    let leftHtml = '<div class="ranking-scroll-content">';
    for (let i = 1; i <= 5; i++) leftHtml += `<img src="obj${i}.svg" class="ranking-sidebar-obj">`;
    for (let i = 1; i <= 5; i++) leftHtml += `<img src="obj${i}.svg" class="ranking-sidebar-obj">`;
    leftHtml += '</div>';

    // 우측: 6-10번 오브제
    let rightHtml = '<div class="ranking-scroll-content">';
    for (let i = 6; i <= 10; i++) rightHtml += `<img src="obj${i}.svg" class="ranking-sidebar-obj">`;
    for (let i = 6; i <= 10; i++) rightHtml += `<img src="obj${i}.svg" class="ranking-sidebar-obj">`;
    rightHtml += '</div>';

    leftSide.innerHTML = leftHtml;
    rightSide.innerHTML = rightHtml;
}

const gameCheckNarrativeBtn = document.getElementById('game-check-narrative-btn');
if (gameCheckNarrativeBtn) {
    gameCheckNarrativeBtn.addEventListener('click', () => {
        gameResultOverlay.style.display = 'none';
        imacBiddingGame.classList.remove('active');
        openNarrativeScreen(currentGameIndex);
    });
}

const rankingPrevBtn = document.getElementById('ranking-prev-btn');
if (rankingPrevBtn) {
    rankingPrevBtn.addEventListener('click', () => {
        document.getElementById('imac-ranking').classList.remove('active');
        imacProducts.classList.add('active');
    });
}

const rankingHomeBtn = document.getElementById('ranking-home-btn');
if (rankingHomeBtn) {
    rankingHomeBtn.addEventListener('click', () => {
        location.reload(); // 처음으로: 페이지 새로고침하여 초기 상태로
    });
}

