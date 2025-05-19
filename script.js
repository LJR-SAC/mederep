const chatLog = document.getElementById("chat-log");
const form = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
appendMessage("👨‍⚕️ MedExpress", "¡Hola! 😊 Soy MedExpress, tu guía inicial cuando no te sientes bien. Cuéntame qué síntomas tienes y te orientaré con calma. Recuerda que siempre es importante visitar al médico 👨‍⚕️👩‍⚕️. Ingresa tus síntomas abajo ⬇");

const mensajes = [
  {
    role: "system",
    content:
      "Eres una herramienta de primera consulta al contraer cualquier enfermedad, adopta un tono tranquilo y conciso, se debe recomendar siempre la búsqueda de atención médica e indicar a qué tipo de especialista visitar, hablas en español e indicas basándote en los síntomas: urgencia y tipo de especialista a visitar, qué tomar en el momento (medicina natural) y la posible enfermedad que posea. Remarcar la importancia de visitar al médico ya que esta no es información experta. Resume todo para que sea amigable y no utilices términos complejos. Utiliza emojis para hacer más amigable el ambiente."
  }
];
function parseMarkdownToHTML(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  
    .replace(/\*(.*?)\*/g, '<em>$1</em>');             
}


form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const texto = userInput.value.trim();
  if (!texto) return;
  

  mensajes.push({ role: "user", content: texto });
  appendMessage("🧑 Usuario", texto);
  userInput.value = "";

  const loadingDiv = document.createElement("div");
  loadingDiv.classList.add("message");
  loadingDiv.id = "loading-message";
  loadingDiv.innerHTML = `
    <strong>👨‍⚕️ MedExpress:</strong> 
    <span class="loading-indicator">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span> Procesando...
    </span>`;
  chatLog.appendChild(loadingDiv);
  chatLog.scrollTop = chatLog.scrollHeight;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages: mensajes })
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content.trim();
      const parsedContent = parseMarkdownToHTML(content);
      mensajes.push({ role: "assistant", content: parsedContent });
      appendMessage("👨‍⚕️ MedExpress", parsedContent);
      narrarTexto(content);
    } else {
      appendMessage("❗Error", "La respuesta del servidor fue vacía.");
    }
  } catch (error) {
    console.error("Error al conectar con el servidor:", error);
    appendMessage("❌ Error", "Hubo un problema al contactar con el servidor.");
  } finally {
    // Asegura que el indicador de carga se elimina siempre
    const loadingMsg = document.getElementById("loading-message");
    if (loadingMsg) loadingMsg.remove();
  }
});

function appendMessage(sender, message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}
function narrarTexto(texto) {
  const narrador = new SpeechSynthesisUtterance(texto);
  narrador.lang = "es-ES";
  narrador.rate = 1;
  narrador.pitch = 1;
  speechSynthesis.speak(narrador);
}
