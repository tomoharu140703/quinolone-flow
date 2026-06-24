import { useState } from "react";

const palette = {
  bg: "#F0F4F8",
  header: "#1A3A5C",
  headerLight: "#2563A8",
  accent: "#E84C4C",
  accentSoft: "#FDE8E8",
  warn: "#D97706",
  warnSoft: "#FEF3C7",
  go: "#15803D",
  goSoft: "#DCFCE7",
  neutral: "#579dfe",
  border: "#CBD5E1",
  arrowColor: "#94A3B8",
};

const infections = [
  { id: "uti_simple", label: "単純性尿路感染症（膀胱炎）" },
  { id: "respiratory", label: "呼吸器感染症（軽症・外来）" },
  { id: "skin", label: "皮膚・軟部組織感染症（軽症）" },
  { id: "switch", label: "注射抗菌薬からの経口スイッチ" },
];

const alternatives = {
  uti_simple: {
    title: "単純性尿路感染症（膀胱炎）",
    custom: true,
  },
  respiratory: {
    title: "呼吸器感染症（軽症・外来）",
    custom: true,
  },
  skin: {
    title: "皮膚・軟部組織感染症（軽症）",
    custom: true,
  },
};

const switchOptions = [
  {
    id: "sulbactam",
    label: "スルバシリン（アンピシリン/スルバクタム）",
    sensitivityRequired: false,
    drugs: [
      { drug: "オーグメンチン（AMPC/CVA）＋アモキシシリン", note: "スルバシリンの経口同等薬。オーグメンチン1錠＋アモキシシリン1錠の組み合わせで使用。", level: "推奨（同列）" },
      { drug: "ユナシンS錠（スルタミシリン）", note: "スルバシリンの経口製剤。バイオアベイラビリティに注意。", level: "推奨（同列）" },
    ],
    caution: null,
  },
  {
    id: "cefazolin",
    label: "セファゾリン（CEZ）",
    sensitivityRequired: false,
    drugs: [
      { drug: "ケフラール（セファクロル）", note: "第一世代経口セフェム系。感受性確認のうえ使用。", level: "推奨" },
    ],
    caution: null,
  },
  {
    id: "cef2g",
    label: "第二世代セフェム系（セフメタゾール等）",
    sensitivityRequired: true,
    drugs: [
      { drug: "オーグメンチン（AMPC/CVA）＋アモキシシリン", note: "感受性ありの場合に推奨。", level: "推奨（感受性確認）" },
    ],
    caution: "感受性結果を必ず確認のうえ選択してください。",
  },
  {
    id: "ceftriaxone",
    label: "セフトリアキソン（CTRX）",
    sensitivityRequired: true,
    drugs: [
      { drug: "βラクタム系（経口）", note: "感受性結果を確認のうえ、適切な経口βラクタム系を選択してください。", level: "推奨（感受性確認）" },
    ],
    caution: "感受性結果に基づいて選択してください。",
  },
  {
    id: "quinolone_inj",
    label: "注射キノロン系",
    sensitivityRequired: true,
    drugs: [
      { drug: "βラクタム系（経口）", note: "感受性結果を確認のうえ、キノロン以外の経口βラクタム系を優先選択してください。", level: "推奨（感受性確認）" },
    ],
    caution: "当施設はフルオロキノロン耐性大腸菌が高率なため、経口移行先としてキノロン系を選択しないことを強く推奨します。",
  },
  {
    id: "other",
    label: "その他の注射抗菌薬",
    sensitivityRequired: false,
    drugs: [],
    consult: true,
    caution: null,
  },
];

// ── UI parts ──────────────────────────────────────────────

const Arrow = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "4px 0" }}>
    <div style={{ width: 2, height: 18, background: palette.arrowColor }} />
    <div style={{ width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: `10px solid ${palette.arrowColor}` }} />
  </div>
);

const BackBtn = ({ onClick }) => (
  <button onClick={onClick} style={{
    alignSelf: "flex-start", background: "none", border: `1.5px solid ${palette.border}`,
    borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600,
    color: palette.neutral, cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", gap: 4,
  }}
    onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
    onMouseLeave={e => e.currentTarget.style.background = "none"}
  >
    ← 戻る
  </button>
);

const Box = ({ children, color = palette.header, bg = "#EEF2F7", style = {} }) => (
  <div style={{
    border: `2px solid ${color}`, borderRadius: 10, background: bg,
    padding: "10px 16px", maxWidth: 480, width: "100%",
    textAlign: "center", fontSize: 14, fontWeight: 600, color,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)", ...style,
  }}>
    {children}
  </div>
);

const levelColor = (level) => {
  if (level.includes("第一") || level.includes("推奨")) return { bg: "#DCFCE7", border: "#15803D", text: "#15803D" };
  if (level.includes("MRSA") || level.includes("感受性確認")) return { bg: "#FEF3C7", border: "#D97706", text: "#D97706" };
  return { bg: "#EEF4FF", border: "#2563A8", text: "#2563A8" };
};

const AlternativeCard = ({ option }) => {
  const c = levelColor(option.level);
  return (
    <div style={{ border: `1.5px solid ${c.border}`, borderRadius: 8, background: c.bg, padding: "10px 14px", marginBottom: 8, textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: c.text, background: "white", border: `1px solid ${c.border}`, borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" }}>
          {option.level}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#1A3A5C" }}>{option.drug}</span>
      </div>
      <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>{option.note}</p>
    </div>
  );
};

const DeescalationBox = () => (
  <div style={{ border: `1.5px solid ${palette.header}`, borderRadius: 8, background: "#EEF4FF", padding: "10px 14px", maxWidth: 480, width: "100%", marginTop: 8 }}>
    <p style={{ fontWeight: 700, color: palette.header, margin: "0 0 4px", fontSize: 12 }}>🔄 De-escalationの機会を逃さない</p>
    <ul style={{ fontSize: 12, color: "#1A3A5C", margin: 0, paddingLeft: 18 }}>
      <li>培養結果確認後、より狭スペクトラムの薬剤への変更を検討</li>
      <li>症状改善を確認しながら最短投与期間を目指す</li>
    </ul>
  </div>
);

// ── Main ──────────────────────────────────────────────────

export default function App() {
  const [step, setStep] = useState("start");
  const [infectionId, setInfectionId] = useState(null);
  const [hasAllergy, setHasAllergy] = useState(null);
  const [hasCulture, setHasCulture] = useState(null);
  const [hasESBL, setHasESBL] = useState(null);
  const [switchAbId, setSwitchAbId] = useState(null);

  const reset = () => {
    setStep("start");
    setInfectionId(null);
    setHasAllergy(null);
    setHasCulture(null);
    setHasESBL(null);
    setSwitchAbId(null);
  };

  const alt = infectionId ? alternatives[infectionId] : null;
  const switchAb = switchAbId ? switchOptions.find(s => s.id === switchAbId) : null;

  const Btn = ({ onClick, children, color = palette.headerLight, small = false }) => (
    <button onClick={onClick} style={{
      background: color, color: "white", border: "none",
      borderRadius: 8, padding: small ? "6px 14px" : "9px 20px",
      fontSize: small ? 12 : 13, fontWeight: 700, cursor: "pointer", margin: "4px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
    }}
      onMouseEnter={e => e.target.style.opacity = 0.85}
      onMouseLeave={e => e.target.style.opacity = 1}
    >
      {children}
    </button>
  );

  const getBackStep = () => {
    if (infectionId === "uti_simple") return hasCulture ? "esbl" : "culture";
    if (infectionId === "switch") return "switch_ab";
    return "culture";
  };

  const NavBtns = () => (
    <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
      <Btn onClick={() => setStep(getBackStep())} color={palette.neutral}>← 戻る</Btn>
      <Btn onClick={reset} color="#475569">最初からやり直す</Btn>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: palette.bg, fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif", padding: "24px 16px" }}>

      {/* Header */}
      <div style={{ maxWidth: 560, margin: "0 auto 24px", background: palette.header, borderRadius: 12, padding: "16px 20px", color: "white" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.7, marginBottom: 4 }}>薬剤部 抗菌薬スチュワードシップ</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>キノロン系 → 代替抗菌薬</div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>変更提案フローチャート</div>
        <div style={{ marginTop: 10, background: "#E84C4C22", border: "1px solid #E84C4C88", borderRadius: 6, padding: "6px 10px", fontSize: 11, color: "#FECACA" }}>
          ⚠ 本施設はフルオロキノロン耐性大腸菌が高率な環境です。キノロン系処方に対して積極的に代替薬変更を提案してください。
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* START */}
        {step === "start" && (
          <>
            <Box color={palette.header} bg="#EEF4FF">💊 キノロン系抗菌薬の処方を確認</Box>
            <Arrow />
            <Box color={palette.warn} bg={palette.warnSoft}>
              ① 緊急性・重篤度の確認<br />
              <span style={{ fontWeight: 400, fontSize: 12 }}>敗血症ショック・ICU症例は主治医と個別協議</span>
            </Box>
            <Arrow />
            <Box color={palette.header} bg="#EEF4FF">② 代替薬検討フローを開始</Box>
            <Arrow />
            <Btn onClick={() => setStep("allergy")}>フローを開始する →</Btn>
          </>
        )}

        {/* STEP 1: アレルギー */}
        {step === "allergy" && (
          <>
            <BackBtn onClick={() => setStep("start")} />
            <Box color={palette.header} bg="#EEF4FF">ステップ 1 / 3<br />アレルギー・禁忌の確認</Box>
            <Arrow />
            <div style={{ border: `2px solid ${palette.warn}`, borderRadius: 10, background: palette.warnSoft, padding: "14px 20px", maxWidth: 480, width: "100%", textAlign: "center" }}>
              <p style={{ margin: "0 0 10px", fontWeight: 700, color: palette.warn, fontSize: 14 }}>
                βラクタム系（ペニシリン・セフェム系）に<br />重篤なアレルギー歴はありますか？
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                <Btn onClick={() => { setHasAllergy(true); setStep("allergy_warn"); }} color="#E84C4C">あり（重篤）</Btn>
                <Btn onClick={() => { setHasAllergy(false); setStep("infection"); }}>なし / 軽微</Btn>
              </div>
            </div>
          </>
        )}

        {/* アレルギーあり */}
        {step === "allergy_warn" && (
          <>
            <BackBtn onClick={() => setStep("allergy")} />
            <div style={{ border: `2px solid ${palette.accent}`, borderRadius: 10, background: palette.accentSoft, padding: "16px 20px", maxWidth: 480, width: "100%" }}>
              <p style={{ fontWeight: 700, color: palette.accent, margin: "0 0 8px" }}>⛔ βラクタム系を含む一般的な代替薬が使用制限されます</p>
              <ul style={{ fontSize: 13, color: "#7F1D1D", margin: 0, paddingLeft: 18 }}>
                <li>アレルギー内容（アナフィラキシーか皮疹のみか）を詳細確認</li>
                <li>ST合剤・ホスホマイシンなど非βラクタム系を検討</li>
                <li>アレルギー科・感染症科にコンサルトを推奨</li>
                <li>キノロン継続が必要な場合は主治医と協議のうえ記録を残す</li>
              </ul>
            </div>
            <Arrow />
            <Box color={palette.neutral} bg="#F1F5F9" style={{ fontSize: 13 }}>主治医に状況を伝え、個別対応へ</Box>
            <div style={{ marginTop: 16 }}><Btn onClick={reset} color={palette.neutral}>最初からやり直す</Btn></div>
          </>
        )}

        {/* STEP 2: 感染症の種類 */}
        {step === "infection" && (
          <>
            <BackBtn onClick={() => setStep("allergy")} />
            <Box color={palette.header} bg="#EEF4FF">ステップ 2 / 3<br />処方の種類を選択</Box>
            <Arrow />
            <div style={{ border: `2px solid ${palette.headerLight}`, borderRadius: 10, background: "white", padding: "14px 20px", maxWidth: 480, width: "100%" }}>
              <p style={{ fontWeight: 700, color: palette.header, margin: "0 0 12px", fontSize: 14 }}>該当する処方パターンを選んでください</p>
              {infections.map(inf => (
                <button key={inf.id}
                  onClick={() => {
                    setInfectionId(inf.id);
                    if (inf.id === "switch") {
                      setStep("switch_ab");
                    } else {
                      setStep("culture");
                    }
                  }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    background: inf.id === "switch" ? "#F0FDF4" : "#F8FAFC",
                    border: `1.5px solid ${inf.id === "switch" ? "#15803D" : palette.border}`,
                    borderRadius: 8, padding: "9px 14px", marginBottom: 6,
                    fontSize: 13, cursor: "pointer", fontWeight: 600,
                    color: inf.id === "switch" ? "#15803D" : palette.header,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = inf.id === "switch" ? "#DCFCE7" : "#EEF4FF"}
                  onMouseLeave={e => e.currentTarget.style.background = inf.id === "switch" ? "#F0FDF4" : "#F8FAFC"}
                >
                  {inf.id === "switch" ? "💉 " : ""}{inf.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 3: 培養結果（経口処方パターン用） */}
        {step === "culture" && (
          <>
            <BackBtn onClick={() => setStep("infection")} />
            <Box color={palette.header} bg="#EEF4FF">ステップ 3 / 3<br />培養・感受性結果の確認</Box>
            <Arrow />
            <div style={{ border: `2px solid ${palette.warn}`, borderRadius: 10, background: palette.warnSoft, padding: "14px 20px", maxWidth: 480, width: "100%", textAlign: "center" }}>
              <p style={{ fontWeight: 700, color: palette.warn, margin: "0 0 6px", fontSize: 14 }}>
                今回または過去の培養・感受性結果はありますか？
              </p>
              <p style={{ fontSize: 11, color: "#92400E", margin: "0 0 12px" }}>※ 過去の結果（直近6ヶ月以内）も参考としてください</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                <Btn onClick={() => {
                  setHasCulture(true);
                  setStep(infectionId === "uti_simple" ? "esbl" : "result");
                }}>
                  結果あり
                </Btn>
                <Btn onClick={() => { setHasCulture(false); setStep("result"); }} color="#64748B">
                  不明 / 結果なし
                </Btn>
              </div>
              <p style={{ fontSize: 11, color: "#92400E", marginTop: 10, marginBottom: 0 }}>
                ※ 培養未提出の場合は変更提案と同時に培養提出を促してください
              </p>
            </div>
          </>
        )}

        {/* STEP ESBL: 膀胱炎・培養ありのみ */}
        {step === "esbl" && (
          <>
            <BackBtn onClick={() => setStep("culture")} />
            <Box color={palette.header} bg="#EEF4FF">ステップ 3b / 3<br />ESBL産生菌の検出確認</Box>
            <Arrow />
            <div style={{ border: `2px solid ${palette.accent}`, borderRadius: 10, background: palette.accentSoft, padding: "14px 20px", maxWidth: 480, width: "100%", textAlign: "center" }}>
              <p style={{ fontWeight: 700, color: palette.accent, margin: "0 0 6px", fontSize: 14 }}>培養結果にESBL産生菌の検出はありますか？</p>
              <p style={{ fontSize: 11, color: "#7F1D1D", margin: "0 0 12px" }}>※ 過去の結果を参照している場合も同様に選択してください</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                <Btn onClick={() => { setHasESBL(true); setStep("result"); }} color={palette.accent}>ESBL あり</Btn>
                <Btn onClick={() => { setHasESBL(false); setStep("result"); }} color={palette.go}>ESBL なし</Btn>
              </div>
            </div>
          </>
        )}

        {/* STEP スイッチ: 注射薬の種類選択 */}
        {step === "switch_ab" && (
          <>
            <BackBtn onClick={() => setStep("infection")} />
            <Box color={palette.go} bg={palette.goSoft}>💉 注射抗菌薬からの経口スイッチ<br /><span style={{ fontWeight: 400, fontSize: 12 }}>現在使用中の注射抗菌薬を選択してください</span></Box>
            <Arrow />
            <div style={{ border: `2px solid ${palette.go}`, borderRadius: 10, background: "white", padding: "14px 20px", maxWidth: 480, width: "100%" }}>
              {switchOptions.map(opt => (
                <button key={opt.id}
                  onClick={() => { setSwitchAbId(opt.id); setStep("switch_result"); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    background: "#F8FAFC", border: `1.5px solid ${palette.border}`,
                    borderRadius: 8, padding: "9px 14px", marginBottom: 6,
                    fontSize: 13, cursor: "pointer", fontWeight: 600, color: palette.header,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#EEF4FF"}
                  onMouseLeave={e => e.currentTarget.style.background = "#F8FAFC"}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* RESULT: 注射スイッチ */}
        {step === "switch_result" && switchAb && (
          <>
            <BackBtn onClick={() => setStep("switch_ab")} />
            <div style={{ background: palette.go, color: "white", borderRadius: 10, padding: "12px 20px", maxWidth: 480, width: "100%", textAlign: "center", fontWeight: 700, fontSize: 15, boxShadow: "0 2px 8px rgba(21,128,61,0.2)" }}>
              ✅ 経口スイッチ提案：{switchAb.label}
            </div>
            <Arrow />

            {switchAb.consult ? (
              <div style={{ border: `2px solid ${palette.neutral}`, borderRadius: 10, background: "#F1F5F9", padding: "16px 20px", maxWidth: 480, width: "100%", textAlign: "center" }}>
                <p style={{ fontWeight: 700, color: palette.neutral, margin: "0 0 8px", fontSize: 15 }}>🏥 感染担当薬剤師に確認してください</p>
                <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>当該注射抗菌薬に対応する経口薬の選択は症例ごとに個別判断が必要です。感染担当薬剤師または感染症科にご相談ください。</p>
              </div>
            ) : (
              <>
                {switchAb.sensitivityRequired && (
                  <div style={{ border: `1.5px solid ${palette.warn}`, borderRadius: 8, background: palette.warnSoft, padding: "8px 14px", maxWidth: 480, width: "100%", fontSize: 12, color: "#92400E", marginBottom: 8 }}>
                    ⚠ 感受性結果を必ず確認のうえ以下の薬剤を提案してください。
                  </div>
                )}
                {switchAb.caution && (
                  <div style={{ border: `1.5px solid ${palette.accent}`, borderRadius: 8, background: palette.accentSoft, padding: "8px 14px", maxWidth: 480, width: "100%", fontSize: 12, color: "#7F1D1D", marginBottom: 8 }}>
                    🔴 {switchAb.caution}
                  </div>
                )}
                <div style={{ maxWidth: 480, width: "100%", marginTop: 4 }}>
                  <p style={{ fontWeight: 700, color: palette.header, margin: "0 0 8px", fontSize: 14 }}>推奨経口スイッチ薬</p>
                  {switchAb.drugs.map((d, i) => <AlternativeCard key={i} option={d} />)}
                </div>
              </>
            )}

            <DeescalationBox />
            <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <Btn onClick={() => setStep("switch_ab")} color={palette.neutral}>← 戻る</Btn>
              <Btn onClick={reset} color="#475569">最初からやり直す</Btn>
            </div>
          </>
        )}

        {/* RESULT: 膀胱炎 */}
        {step === "result" && infectionId === "uti_simple" && (
          <>
            <BackBtn onClick={() => setStep(hasCulture ? "esbl" : "culture")} />
            <div style={{ background: palette.go, color: "white", borderRadius: 10, padding: "12px 20px", maxWidth: 480, width: "100%", textAlign: "center", fontWeight: 700, fontSize: 15, boxShadow: "0 2px 8px rgba(21,128,61,0.2)" }}>
              ✅ 変更提案推奨：単純性尿路感染症（膀胱炎）
            </div>
            <Arrow />

            {/* 培養なし */}
            {!hasCulture && (
              <>
                <div style={{ border: `1.5px solid ${palette.warn}`, borderRadius: 8, background: palette.warnSoft, padding: "8px 14px", maxWidth: 480, width: "100%", fontSize: 12, color: "#92400E", marginBottom: 8 }}>
                  ⚠ 培養結果不明：経験的治療として以下を提案。培養提出を強く推奨してください。
                </div>
                <div style={{ maxWidth: 480, width: "100%", marginTop: 4 }}>
                  <p style={{ fontWeight: 700, color: palette.header, margin: "0 0 8px", fontSize: 14 }}>推奨代替抗菌薬</p>
                  <AlternativeCard option={{ drug: "ケフラール（セファクロル）/ オーグメンチン（AMPC/CVA）", note: "経口βラクタム系。3〜5日間投与。アモキシシリン単剤は感受性不明のため除外。", level: "第一推奨" }} />
                  <AlternativeCard option={{ drug: "ST合剤（TMP/SMX）", note: "経口投与可。3〜5日間投与。施設の耐性状況を考慮すること。", level: "第二推奨" }} />
                  <AlternativeCard option={{ drug: "ホスホマイシン（経口）", note: "1回投与で完結。妊婦・高齢者にも使いやすい。", level: "代替選択肢" }} />
                </div>
              </>
            )}

            {/* 培養あり・ESBL陰性 */}
            {hasCulture && hasESBL === false && (
              <>
                <div style={{ border: `1.5px solid ${palette.go}`, borderRadius: 8, background: palette.goSoft, padding: "8px 14px", maxWidth: 480, width: "100%", fontSize: 12, color: "#166534", marginBottom: 8 }}>
                  ✔ ESBL陰性・感受性結果あり：感受性を確認のうえ変更提案してください。
                </div>
                <div style={{ maxWidth: 480, width: "100%", marginTop: 4 }}>
                  <p style={{ fontWeight: 700, color: palette.header, margin: "0 0 8px", fontSize: 14 }}>推奨代替抗菌薬</p>
                  <AlternativeCard option={{ drug: "ケフラール（セファクロル）/ オーグメンチン（AMPC/CVA）", note: "感受性確認のうえ第一選択。3〜5日間投与。", level: "第一推奨" }} />
                  <AlternativeCard option={{ drug: "ST合剤（TMP/SMX）", note: "感受性確認のうえ使用。3〜5日間投与。", level: "第二推奨" }} />
                  <AlternativeCard option={{ drug: "ホスホマイシン（経口）", note: "上記が使用困難な場合の代替。1回投与可。", level: "代替選択肢" }} />
                </div>
              </>
            )}

            {/* 培養あり・ESBL陽性 */}
            {hasCulture && hasESBL === true && (
              <>
                <div style={{ border: `1.5px solid ${palette.accent}`, borderRadius: 8, background: palette.accentSoft, padding: "8px 14px", maxWidth: 480, width: "100%", fontSize: 12, color: "#7F1D1D", marginBottom: 8 }}>
                  🔴 ESBL産生菌検出：感受性結果を必ず確認のうえ優先順位に従って選択してください。
                </div>
                <div style={{ maxWidth: 480, width: "100%", marginTop: 4 }}>
                  <p style={{ fontWeight: 700, color: palette.header, margin: "0 0 8px", fontSize: 14 }}>推奨代替抗菌薬（感受性確認必須）</p>
                  <AlternativeCard option={{ drug: "ST合剤（TMP/SMX）", note: "ESBL産生菌にも有効なことが多い。感受性ありの場合に第一選択。3〜5日間投与。", level: "第一推奨" }} />
                  <AlternativeCard option={{ drug: "ファロム（ファロペネム）", note: "経口カルバペネム系。ST合剤が使用できない場合に選択。3〜5日間投与。", level: "第二推奨" }} />
                  <div style={{ border: "1.5px solid #7C3AED", borderRadius: 8, background: "#F5F3FF", padding: "10px 14px", marginBottom: 8, textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#7C3AED", background: "white", border: "1px solid #7C3AED", borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" }}>
                        ST合剤・ファロム両方耐性かつキノロン感受性あり
                      </span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#1A3A5C", margin: "0 0 4px" }}>ジェニナック（ガレノキサシン）</p>
                    <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>
                      フルオロキノロン系のため<strong>感受性確認が必須</strong>。当施設はフルオロキノロン耐性大腸菌が高率なため<strong>交差耐性に注意</strong>。使用前に主治医・感染症科と協議すること。
                    </p>
                  </div>
                  <div style={{ border: `1.5px solid ${palette.neutral}`, borderRadius: 8, background: "#F8FAFC", padding: "10px 14px", marginBottom: 8, textAlign: "left" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: palette.neutral, margin: "0 0 4px" }}>🏥 全ての薬剤に耐性の場合</p>
                    <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>感染症科へコンサルト。注射薬（カルバペネム系など）の適応を検討してください。</p>
                  </div>
                </div>
              </>
            )}

            <div style={{ border: `1.5px solid #6366F1`, borderRadius: 8, background: "#EEF2FF", padding: "10px 14px", maxWidth: 480, width: "100%", marginTop: 4 }}>
              <p style={{ fontWeight: 700, color: "#4338CA", margin: "0 0 4px", fontSize: 12 }}>📋 注意事項</p>
              <p style={{ fontSize: 12, color: "#3730A3", margin: 0 }}>治療期間は原則3〜5日間。培養結果が出た場合は速やかにde-escalationを検討。再発・難治例は泌尿器科・感染症科へコンサルト。</p>
            </div>
            <DeescalationBox />
            <NavBtns />
          </>
        )}

        {/* RESULT: 呼吸器感染症 */}
        {step === "result" && infectionId === "respiratory" && (
          <>
            <BackBtn onClick={() => setStep("culture")} />
            <div style={{ background: palette.go, color: "white", borderRadius: 10, padding: "12px 20px", maxWidth: 480, width: "100%", textAlign: "center", fontWeight: 700, fontSize: 15, boxShadow: "0 2px 8px rgba(21,128,61,0.2)" }}>
              ✅ 変更提案推奨：呼吸器感染症（軽症・外来）
            </div>
            <Arrow />

            {/* 感受性あり */}
            {hasCulture && (
              <>
                <div style={{ border: `1.5px solid ${palette.go}`, borderRadius: 8, background: palette.goSoft, padding: "8px 14px", maxWidth: 480, width: "100%", fontSize: 12, color: "#166534", marginBottom: 8 }}>
                  ✔ 感受性結果あり：感受性を確認のうえ以下の優先順位で変更提案してください。
                </div>
                <div style={{ maxWidth: 480, width: "100%", marginTop: 4 }}>
                  <p style={{ fontWeight: 700, color: palette.header, margin: "0 0 8px", fontSize: 14 }}>推奨代替抗菌薬</p>
                  <div style={{ border: `1.5px solid ${palette.go}`, borderRadius: 8, background: palette.goSoft, padding: "10px 14px", marginBottom: 8, textAlign: "left" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: palette.go, background: "white", border: `1px solid ${palette.go}`, borderRadius: 4, padding: "1px 6px" }}>第一選択｜βラクタム系</span>
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {[
                        { drug: "オーグメンチン（AMPC/CVA）＋アモキシシリン", note: "広域カバー。βラクタマーゼ産生菌にも有効。" },
                        { drug: "ユナシンS錠（スルタミシリン）", note: "オーグメンチンの代替経口製剤。" },
                        { drug: "アモキシシリン（AMPC）", note: "典型的市中肺炎の第一選択。感受性確認のうえ使用。" },
                        { drug: "ケフラール（セファクロル）", note: "第一世代経口セフェム系。感受性確認のうえ使用。" },
                      ].map((d, i) => (
                        <div key={i} style={{ background: "white", borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
                          <span style={{ fontWeight: 700, color: "#1A3A5C" }}>{d.drug}</span>
                          <p style={{ fontSize: 11, color: "#475569", margin: "2px 0 0" }}>{d.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ border: `1.5px solid ${palette.warn}`, borderRadius: 8, background: palette.warnSoft, padding: "10px 14px", marginBottom: 8, textAlign: "left" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: palette.warn, background: "white", border: `1px solid ${palette.warn}`, borderRadius: 4, padding: "1px 6px" }}>第二選択｜マクロライド系</span>
                    <div style={{ marginTop: 8, background: "white", borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
                      <span style={{ fontWeight: 700, color: "#1A3A5C" }}>マクロライド系抗菌薬</span>
                      <p style={{ fontSize: 11, color: "#475569", margin: "2px 0 0" }}>非定型菌カバーが必要な場合や第一選択が使用困難な場合に。</p>
                      <p style={{ fontSize: 11, color: "#92400E", margin: "4px 0 0", fontWeight: 600 }}>⚠ 薬物相互作用に注意（QT延長、CYP3A4阻害等）</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 感受性なし・不明 */}
            {!hasCulture && (
              <>
                <div style={{ border: `1.5px solid ${palette.warn}`, borderRadius: 8, background: palette.warnSoft, padding: "8px 14px", maxWidth: 480, width: "100%", fontSize: 12, color: "#92400E", marginBottom: 8 }}>
                  ⚠ 培養結果不明：経験的治療として以下を提案。培養提出を推奨してください。
                </div>
                <div style={{ maxWidth: 480, width: "100%", marginTop: 4 }}>
                  <p style={{ fontWeight: 700, color: palette.header, margin: "0 0 8px", fontSize: 14 }}>推奨代替抗菌薬</p>
                  <AlternativeCard option={{ drug: "オーグメンチン（AMPC/CVA）＋アモキシシリン", note: "経験的治療の推奨薬。βラクタマーゼ産生菌も含めた広域カバーが可能。", level: "第一推奨" }} />
                </div>
              </>
            )}

            <div style={{ border: `1.5px solid #6366F1`, borderRadius: 8, background: "#EEF2FF", padding: "10px 14px", maxWidth: 480, width: "100%", marginTop: 4 }}>
              <p style={{ fontWeight: 700, color: "#4338CA", margin: "0 0 4px", fontSize: 12 }}>📋 注意事項</p>
              <p style={{ fontSize: 12, color: "#3730A3", margin: 0 }}>内服処方の時点で軽症と判断されているものとして対応。症状悪化時は入院・静注抗菌薬への変更を考慮するよう医師に伝えること。</p>
            </div>
            <DeescalationBox />
            <NavBtns />
          </>
        )}

        {/* RESULT: 皮膚・軟部組織感染症 */}
        {step === "result" && infectionId === "skin" && (
          <>
            <BackBtn onClick={() => setStep("culture")} />
            <div style={{ background: palette.go, color: "white", borderRadius: 10, padding: "12px 20px", maxWidth: 480, width: "100%", textAlign: "center", fontWeight: 700, fontSize: 15, boxShadow: "0 2px 8px rgba(21,128,61,0.2)" }}>
              ✅ 変更提案推奨：皮膚・軟部組織感染症（軽症）
            </div>
            <Arrow />

            {/* 感受性あり */}
            {hasCulture && (
              <>
                <div style={{ border: `1.5px solid ${palette.go}`, borderRadius: 8, background: palette.goSoft, padding: "8px 14px", maxWidth: 480, width: "100%", fontSize: 12, color: "#166534", marginBottom: 8 }}>
                  ✔ 感受性結果あり：感受性を確認のうえ以下の優先順位で変更提案してください。
                </div>
                <div style={{ maxWidth: 480, width: "100%", marginTop: 4 }}>
                  <p style={{ fontWeight: 700, color: palette.header, margin: "0 0 8px", fontSize: 14 }}>推奨代替抗菌薬</p>

                  {/* 第一選択 */}
                  <div style={{ border: `1.5px solid ${palette.go}`, borderRadius: 8, background: palette.goSoft, padding: "10px 14px", marginBottom: 8, textAlign: "left" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: palette.go, background: "white", border: `1px solid ${palette.go}`, borderRadius: 4, padding: "1px 6px" }}>第一選択</span>
                    <div style={{ marginTop: 8, background: "white", borderRadius: 6, padding: "6px 10px" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1A3A5C" }}>ケフラール（セファクロル）</span>
                      <p style={{ fontSize: 11, color: "#475569", margin: "2px 0 0" }}>グラム陽性球菌主体の皮膚感染症に。</p>
                      <p style={{ fontSize: 11, color: "#92400E", margin: "4px 0 0", fontWeight: 600 }}>⚠ 最大用量で使用すること</p>
                    </div>
                  </div>

                  {/* 第二選択 */}
                  <div style={{ border: `1.5px solid ${palette.warn}`, borderRadius: 8, background: palette.warnSoft, padding: "10px 14px", marginBottom: 8, textAlign: "left" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: palette.warn, background: "white", border: `1px solid ${palette.warn}`, borderRadius: 4, padding: "1px 6px" }}>第二選択</span>
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {[
                        { drug: "オーグメンチン（AMPC/CVA）＋アモキシシリン", note: "嫌気性菌や混合感染が疑われる場合に。" },
                        { drug: "アモキシシリン（AMPC）", note: "感受性確認のうえ使用。" },
                        { drug: "ユナシンS錠（スルタミシリン）", note: "オーグメンチンの代替経口製剤。" },
                      ].map((d, i) => (
                        <div key={i} style={{ background: "white", borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
                          <span style={{ fontWeight: 700, color: "#1A3A5C" }}>{d.drug}</span>
                          <p style={{ fontSize: 11, color: "#475569", margin: "2px 0 0" }}>{d.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 第三選択 */}
                  <div style={{ border: `1.5px solid ${palette.neutral}`, borderRadius: 8, background: "#F8FAFC", padding: "10px 14px", marginBottom: 8, textAlign: "left" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: palette.neutral, background: "white", border: `1px solid ${palette.neutral}`, borderRadius: 4, padding: "1px 6px" }}>第三選択</span>
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {[
                        { drug: "ST合剤（TMP/SMX）", note: "上記が使用困難な場合。CA-MRSA疑い時にも有用。" },
                        { drug: "ミノマイシン（ミノサイクリン）", note: "上記が使用困難な場合の代替。薬物相互作用・光線過敏に注意。" },
                      ].map((d, i) => (
                        <div key={i} style={{ background: "white", borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
                          <span style={{ fontWeight: 700, color: "#1A3A5C" }}>{d.drug}</span>
                          <p style={{ fontSize: 11, color: "#475569", margin: "2px 0 0" }}>{d.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 感受性なし・不明 */}
            {!hasCulture && (
              <>
                <div style={{ border: `1.5px solid ${palette.warn}`, borderRadius: 8, background: palette.warnSoft, padding: "8px 14px", maxWidth: 480, width: "100%", fontSize: 12, color: "#92400E", marginBottom: 8 }}>
                  ⚠ 培養結果不明：経験的治療として以下を提案。培養提出を推奨してください。
                </div>
                <div style={{ maxWidth: 480, width: "100%", marginTop: 4 }}>
                  <p style={{ fontWeight: 700, color: palette.header, margin: "0 0 8px", fontSize: 14 }}>推奨代替抗菌薬</p>

                  {/* 第一選択 */}
                  <div style={{ border: `1.5px solid ${palette.go}`, borderRadius: 8, background: palette.goSoft, padding: "10px 14px", marginBottom: 8, textAlign: "left" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: palette.go, background: "white", border: `1px solid ${palette.go}`, borderRadius: 4, padding: "1px 6px" }}>第一選択</span>
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {[
                        { drug: "ケフラール（セファクロル）", note: "グラム陽性球菌主体の皮膚感染症に。最大用量で使用すること。" },
                        { drug: "オーグメンチン（AMPC/CVA）＋アモキシシリン", note: "嫌気性菌・混合感染リスクがある場合に。最大用量で使用すること。" },
                      ].map((d, i) => (
                        <div key={i} style={{ background: "white", borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
                          <span style={{ fontWeight: 700, color: "#1A3A5C" }}>{d.drug}</span>
                          <p style={{ fontSize: 11, color: "#475569", margin: "2px 0 0" }}>{d.note}</p>
                          <p style={{ fontSize: 11, color: "#92400E", margin: "2px 0 0", fontWeight: 600 }}>⚠ 最大用量で使用すること</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 第二選択 */}
                  <div style={{ border: `1.5px solid ${palette.warn}`, borderRadius: 8, background: palette.warnSoft, padding: "10px 14px", marginBottom: 8, textAlign: "left" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: palette.warn, background: "white", border: `1px solid ${palette.warn}`, borderRadius: 4, padding: "1px 6px" }}>第二選択</span>
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {[
                        { drug: "ST合剤（TMP/SMX）", note: "上記が使用困難な場合。CA-MRSA疑い時にも有用。" },
                        { drug: "ミノマイシン（ミノサイクリン）", note: "上記が使用困難な場合の代替。薬物相互作用・光線過敏に注意。" },
                      ].map((d, i) => (
                        <div key={i} style={{ background: "white", borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
                          <span style={{ fontWeight: 700, color: "#1A3A5C" }}>{d.drug}</span>
                          <p style={{ fontSize: 11, color: "#475569", margin: "2px 0 0" }}>{d.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div style={{ border: `1.5px solid #6366F1`, borderRadius: 8, background: "#EEF2FF", padding: "10px 14px", maxWidth: 480, width: "100%", marginTop: 4 }}>
              <p style={{ fontWeight: 700, color: "#4338CA", margin: "0 0 4px", fontSize: 12 }}>📋 注意事項</p>
              <p style={{ fontSize: 12, color: "#3730A3", margin: 0 }}>キノロン系は軽症皮膚感染症への適応として過剰スペクトラムになりやすい。グラム陽性球菌主体の症例にはセフェム系を優先すること。症状悪化時は入院・静注への変更を検討。</p>
            </div>
            <DeescalationBox />
            <NavBtns />
          </>
        )}

        {/* RESULT: 呼吸器・皮膚 */}
        {step === "result" && alt && !alt.custom && (
          <>
            <div style={{ background: palette.go, color: "white", borderRadius: 10, padding: "12px 20px", maxWidth: 480, width: "100%", textAlign: "center", fontWeight: 700, fontSize: 15, boxShadow: "0 2px 8px rgba(21,128,61,0.2)" }}>
              ✅ 変更提案推奨：{alt.title}
            </div>
            <Arrow />
            <div style={{ border: `1.5px solid ${hasCulture ? palette.go : palette.warn}`, borderRadius: 8, background: hasCulture ? palette.goSoft : palette.warnSoft, padding: "8px 14px", maxWidth: 480, width: "100%", fontSize: 12, color: hasCulture ? "#166534" : "#92400E", marginBottom: 8 }}>
              {hasCulture
                ? "✔ 感受性結果あり：以下の代替薬の感受性を確認のうえ変更提案してください。"
                : "⚠ 培養結果不明：経験的治療として下記を提案しつつ、培養提出を推奨してください。"}
            </div>
            <div style={{ maxWidth: 480, width: "100%", marginTop: 4 }}>
              <p style={{ fontWeight: 700, color: palette.header, margin: "0 0 8px", fontSize: 14 }}>推奨代替抗菌薬</p>
              {alt.options.map((opt, i) => <AlternativeCard key={i} option={opt} />)}
            </div>
            <div style={{ border: `1.5px solid #6366F1`, borderRadius: 8, background: "#EEF2FF", padding: "10px 14px", maxWidth: 480, width: "100%", marginTop: 4 }}>
              <p style={{ fontWeight: 700, color: "#4338CA", margin: "0 0 4px", fontSize: 12 }}>📋 注意事項</p>
              <p style={{ fontSize: 12, color: "#3730A3", margin: 0 }}>{alt.caution}</p>
            </div>
            <DeescalationBox />
            <NavBtns />
          </>
        )}

        <div style={{ marginTop: 24, fontSize: 11, color: palette.neutral, textAlign: "center", maxWidth: 480 }}>
          本フローチャートは当院の感染対策方針に基づく参考ツールです。<br />
          最終的な処方変更は医師の判断によります。個別症例は感染症科へコンサルトしてください。
        </div>
      </div>
    </div>
  );
}
