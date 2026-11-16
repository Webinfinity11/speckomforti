import { MessageActions } from "@/components/admin/MessageActions";
import { getMessages } from "@/lib/data";

export default async function MessagesAdmin() {
  const messages = await getMessages();
  return (
    <>
      <div className="adm-head"><div><h1>შეტყობინებები</h1><p>საიტის ფორმებიდან (კონტაქტი, პროდუქტის შეკვეთა, სერვისი) გამოგზავნილი შეტყობინებები.</p></div></div>
      {messages.length ? messages.map((m) => (
        <div key={m.id} className={`adm-msg${m.is_read ? "" : " unread"}`}>
          <header>
            <div>
              <b>{m.name}</b>
              {m.phone && <> · <a href={`tel:${m.phone.replace(/[^\d+]/g, "")}`}>{m.phone}</a></>}
              {m.email && <> · <a href={`mailto:${m.email}`}>{m.email}</a></>}
              {m.subject && <div><span className="adm-badge on">{m.subject}</span></div>}
            </div>
            <small style={{ color: "#8a8e96" }}>{new Date(m.created_at).toLocaleString("ka-GE", { timeZone: "Asia/Tbilisi" })}</small>
          </header>
          {m.body && <p>{m.body}</p>}
          <MessageActions id={m.id} read={m.is_read} />
        </div>
      )) : <div className="adm-card"><p style={{ margin: 0, color: "#6b6f78" }}>შეტყობინებები ჯერ არ არის.</p></div>}
    </>
  );
}
