"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LangProvider";
import { useToast } from "@/components/Toast";
import { Ico } from "@/components/icons";
import { renderMd, shortText } from "@/lib/utils";

type Msg = { id?: string; role: "user" | "assistant"; content: string };
type Restaurant = { name: string; style: string; season: string; price: string; restrictions: string };
type Idea = { id: string; text: string };

export default function ChatPage() {
  const { t, lang } = useLang();
  const toast = useToast();
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [chefInitials, setChefInitials] = useState("TU");
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/restaurant").then((r) => r.json()).then(setRestaurant).catch(() => {});
    fetch("/api/ideas").then((r) => r.json()).then((l: Idea[]) => setIdeas(l.slice(0, 5))).catch(() => {});
    fetch("/api/profile").then((r) => r.json()).then((p) => p?.initials && setChefInitials(p.initials)).catch(() => {});
    fetch("/api/conversations").then((r) => r.json()).then((list) => {
      const last = list[0];
      if (last) {
        setConvId(last.id);
        setMessages(last.messages.map((m: Msg) => ({ id: m.id, role: m.role, content: m.content })));
      }
    }).catch(() => {});

    const prefill = sessionStorage.getItem("chat:prefill");
    if (prefill) {
      sessionStorage.removeItem("chat:prefill");
      setInput(prefill);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          autoGrow(inputRef.current);
        }
      }, 30);
    }
  }, []);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, thinking]);

  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }

  async function send() {
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setMessages((m) => [...m, { role: "user", content: text }]);
    setThinking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId: convId, message: text, lang }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setConvId(data.conversationId);
      setMessages((m) => [...m, { id: data.message.id, role: "assistant", content: data.message.content }]);
    } catch (e) {
      const err = e as { message?: string };
      setMessages((m) => [...m, { role: "assistant", content: `_(Error)_\n\n${err.message || ""}` }]);
    } finally {
      setThinking(false);
    }
  }

  async function newConversation() {
    setMessages([]);
    setConvId(null);
    setInput("");
  }

  async function saveAsRecipe() {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) {
      toast(t("toast-no-message"));
      return;
    }
    const h = last.content.match(/^#+\s*(.+)$/m);
    const name = prompt(t("prompt-recipe-name"), h?.[1]?.trim() || "");
    if (!name) return;
    const cat = prompt(t("prompt-recipe-cat"), t("category-meats")) || "—";
    const summary = last.content.replace(/[#*`]/g, "").replace(/\n+/g, " ").slice(0, 180);
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, category: cat, summary, content: last.content, status: "draft" }),
    });
    if (res.ok) {
      toast(t("toast-recipe-saved"));
      router.push("/recipes");
    }
  }

  function pickSuggestion(s: string) {
    setInput(s);
    setTimeout(() => inputRef.current && (autoGrow(inputRef.current), inputRef.current.focus()), 30);
  }

  function pickIdea(i: Idea) {
    setInput(`${t("idea-prompt-prefix")}\n\n"${i.text}"`);
    setTimeout(() => inputRef.current && (autoGrow(inputRef.current), inputRef.current.focus()), 30);
  }

  const ctxTags = restaurant
    ? [
        { k: t("casa-name"), v: restaurant.name, accent: true },
        { k: t("casa-style").split(" ")[0], v: shortText(restaurant.style, 40) },
        { k: "Stag.", v: shortText(restaurant.season, 28) },
        { k: "€", v: shortText(restaurant.price, 24) },
      ]
    : [];

  const suggestions = ["sugg-1", "sugg-2", "sugg-3", "sugg-4"].map((k) => t(k));

  return (
    <div className="chat-screen">
      <div className="chat-banner">
        <div className="chat-banner-left">
          {ctxTags.map((tg, i) => (
            <span key={i} className={`ctx-tag${tg.accent ? " accent" : ""}`}>
              <span className="k">{tg.k}</span> {tg.v}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={newConversation}>
            <Ico.plus />
            <span>{t("chat-new")}</span>
          </button>
          <button className="btn btn-accent btn-sm" onClick={saveAsRecipe}>
            <Ico.bookmark />
            <span>{t("chat-save-recipe")}</span>
          </button>
        </div>
      </div>

      <div className="chat-body">
        <div className="chat-thread-wrap">
          <div className="chat-thread" ref={threadRef}>
            <div className="messages">
              {messages.length === 0 ? (
                <div className="chat-empty">
                  <div className="ico">¶</div>
                  <div className="h">{t("chat-empty-h")}</div>
                  <div className="s">{t("chat-empty-s")}</div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={m.id || i} className={`msg ${m.role}`}>
                    <div className="msg-avatar">{m.role === "user" ? chefInitials : "AC"}</div>
                    <div
                      className="msg-bubble"
                      dangerouslySetInnerHTML={
                        m.role === "assistant"
                          ? { __html: renderMd(m.content) }
                          : { __html: m.content.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)).replace(/\n/g, "<br>") }
                      }
                    />
                  </div>
                ))
              )}
              {thinking && (
                <div className="msg assistant">
                  <div className="msg-avatar">AC</div>
                  <div className="msg-bubble">
                    <span className="msg-typing"></span>
                    <span className="msg-typing"></span>
                    <span className="msg-typing"></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="chat-composer">
            <div className="chat-composer-inner">
              <textarea
                ref={inputRef}
                rows={1}
                placeholder={t("chat-ph")}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  autoGrow(e.target);
                }}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    send();
                  } else if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <button className="send" onClick={send} disabled={thinking || !input.trim()} title="Enviar">
                <Ico.send />
              </button>
              <div className="hint">{t("chat-hint")}</div>
            </div>
          </div>
        </div>

        <aside className="chat-aside">
          <div className="group">
            <div className="group-h">{t("suggestions-h")}</div>
            {suggestions.map((s, i) => (
              <button key={i} className="suggestion" onClick={() => pickSuggestion(s)}>
                {s}
              </button>
            ))}
          </div>
          <div className="group">
            <div className="group-h">{t("recent-ideas-h")}</div>
            {ideas.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--ink-mute)", fontFamily: "var(--f-serif)", fontStyle: "italic" }}>—</div>
            ) : (
              ideas.map((i) => (
                <button key={i.id} className="aside-idea" onClick={() => pickIdea(i)}>
                  {shortText(i.text, 80)}
                </button>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
