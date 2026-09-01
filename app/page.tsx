"use client";

import { FormEvent, useMemo, useState } from "react";

type AgentRole = {
  id: string;
  role: string;
  label: string;
  action: string;
  output: string;
  checkpoint?: string;
  tone: string;
};

const examples = [
  "新商品の紹介ページを公開したい",
  "社内勉強会を企画したい",
  "週末の旅行プランを作りたい",
];

const keywordRules = [
  {
    words: ["企画", "イベント", "勉強会", "旅行"],
    action: "目的・参加者・制約を整理し、進行しやすい実施案へ落とし込む。",
    output: "実施プランとタイムライン",
    checkpoint: "予算・日程・参加範囲を人が確定",
  },
  {
    words: ["記事", "紹介", "ページ", "資料", "投稿"],
    action: "読み手と伝える順番を設計し、必要な素材とメッセージをまとめる。",
    output: "構成案とコンテンツ草案",
    checkpoint: "公開表現・固有名詞・最終トーンを人が確認",
  },
  {
    words: ["調査", "比較", "選定", "分析"],
    action: "判断軸を定め、候補を同じ基準で比較して根拠を短く整理する。",
    output: "比較表と推奨案",
    checkpoint: "採用する判断軸と最終選択を人が決定",
  },
];

function buildPlan(goal: string): AgentRole[] {
  const matched = keywordRules.find((rule) =>
    rule.words.some((word) => goal.includes(word)),
  );
  const needsFour = goal.length > 18 || /公開|顧客|社外|予算|契約/.test(goal);

  const roles: AgentRole[] = [
    {
      id: "01",
      role: "オーケストレーター",
      label: "方向づけ",
      action: `「${goal}」の完成条件を定義し、作業の順番と受け渡しを設計する。`,
      output: "ゴール定義と分担表",
      checkpoint: "目的と“どこまでやるか”を人が承認",
      tone: "violet",
    },
    {
      id: "02",
      role: matched ? "プランナー" : "リサーチャー",
      label: matched ? "計画する" : "確かめる",
      action:
        matched?.action ??
        "必要な情報・前提・選択肢を集め、次の担当が迷わない材料に整理する。",
      output: matched?.output ?? "要点メモと選択肢",
      checkpoint: matched?.checkpoint,
      tone: "blue",
    },
    {
      id: "03",
      role: "ビルダー",
      label: "形にする",
      action: "整理された方針をもとに、まず試せる具体的な成果物を組み立てる。",
      output: "初版の成果物",
      tone: "mint",
    },
  ];

  if (needsFour) {
    roles.push({
      id: "04",
      role: "レビューガード",
      label: "整える",
      action: "完成条件・抜け漏れ・公開リスクを確認し、修正点を優先順に返す。",
      output: "確認結果と公開判定",
      checkpoint: "外部公開・支払い・最終決定は人が実行",
      tone: "orange",
    });
  }

  return roles;
}

export default function Home() {
  const [goal, setGoal] = useState("");
  const [submittedGoal, setSubmittedGoal] = useState("");
  const [roles, setRoles] = useState<AgentRole[]>([]);
  const characterCount = useMemo(() => goal.trim().length, [goal]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanGoal = goal.trim();
    if (!cleanGoal) return;
    setSubmittedGoal(cleanGoal);
    setRoles(buildPlan(cleanGoal));
    window.setTimeout(() => {
      document.getElementById("plan")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function useExample(example: string) {
    setGoal(example);
    document.getElementById("goal")?.focus();
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="AIチーム委任プランナー トップ">
          <span className="brand-mark">AT</span>
          <span>AIチーム委任プランナー</span>
        </a>
        <span className="status"><i /> ルールベースで動作</span>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow">DELEGATE WITH CLARITY</div>
        <h1>
          その仕事、<br />
          <span>AIチーム</span>ならどう分ける？
        </h1>
        <p className="lead">
          やりたいことをひとつ書くだけ。AIエージェントの役割分担と、
          人が判断すべきポイントを30秒で見える化します。
        </p>

        <form className="planner" onSubmit={submit}>
          <label htmlFor="goal">やりたいこと</label>
          <div className="input-row">
            <input
              id="goal"
              type="text"
              value={goal}
              onChange={(event) => setGoal(event.target.value.slice(0, 100))}
              placeholder="例：新商品の紹介ページを公開したい"
              autoComplete="off"
              aria-describedby="goal-hint"
            />
            <button type="submit" disabled={!goal.trim()}>
              委任プランを作る <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="input-meta" id="goal-hint">
            <span>具体的に書くほど分担が明確になります</span>
            <span>{characterCount} / 100</span>
          </div>
        </form>

        <div className="examples" aria-label="入力例">
          <span>たとえば</span>
          {examples.map((example) => (
            <button key={example} type="button" onClick={() => useExample(example)}>
              {example}
            </button>
          ))}
        </div>
      </section>

      {roles.length > 0 && (
        <section className="results" id="plan" aria-live="polite">
          <div className="result-heading">
            <div>
              <span className="section-number">01 / DELEGATION PLAN</span>
              <h2>このチームで進めます</h2>
            </div>
            <div className="goal-summary">
              <span>MISSION</span>
              <strong>{submittedGoal}</strong>
            </div>
          </div>

          <div className="flow-line" aria-hidden="true">
            {roles.map((role) => <span key={role.id}>{role.id}</span>)}
          </div>

          <div className="role-grid">
            {roles.map((role) => (
              <article className={`role-card ${role.tone}`} key={role.id}>
                <div className="card-top">
                  <span className="role-id">AGENT {role.id}</span>
                  <span className="role-label">{role.label}</span>
                </div>
                <h3>{role.role}</h3>
                <p>{role.action}</p>
                <div className="deliverable">
                  <span>OUTPUT</span>
                  <strong>{role.output}</strong>
                </div>
                {role.checkpoint && (
                  <div className="checkpoint">
                    <span aria-hidden="true">◆</span>
                    <div>
                      <small>人間確認ポイント</small>
                      <b>{role.checkpoint}</b>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>

          <aside className="handoff-note">
            <span>TEAM TIP</span>
            <p>
              AI同士の受け渡しでは、前の担当の「OUTPUT」を次の担当への入力に。
              最終責任は人が持ち、判断の節目だけ確認しましょう。
            </p>
          </aside>
        </section>
      )}

      <footer>
        <span>AI TEAM DELEGATION PLANNER</span>
        <span>外部API・入力データ送信なし</span>
      </footer>
    </main>
  );
}
