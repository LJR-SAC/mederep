const chatLog = document.getElementById("chat-log");
const form = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
appendMessage("👨‍⚕️ MedExpress", "¡Hola! 😊 Soy MedExpress, tu guía inicial cuando no te sientes bien. Cuéntame qué síntomas tienes y te orientaré con calma. Recuerda que siempre es importante visitar al médico 👨‍⚕️👩‍⚕️. Ingresa tus síntomas abajo ⬇");

const mensajes = [
  {
    role: "system",
    content:
      "Eres un asistente médico de primera consulta. Tu tono es tranquilo, claro y amigable 😊. Siempre debes recomendar visitar a un profesional de salud 🩺. Cuando el usuario ingrese sus síntomas, responde con: 1️⃣ Nivel de urgencia, 2️⃣ Tipo de especialista recomendado 👨‍⚕️, 3️⃣ Qué tomar de forma natural 🌿 como primer alivio, y 4️⃣ Posible enfermedad 🤔. Resume todo en un solo párrafo fácil de entender, usa emojis para hacerlo más amigable. No uses términos médicos complejos y nunca olvides recordar que esta información no sustituye una consulta médica profesional ⚠️" 
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

    } else {
      appendMessage("❗Error", "La respuesta del servidor fue vacía.");
    }
  } catch (error) {
    console.error("Error al conectar con el servidor:", error);
    appendMessage("❌ Error", "Hubo un problema al contactar con el servidor.");
  } finally {
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



