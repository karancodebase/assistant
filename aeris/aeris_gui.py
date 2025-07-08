import tkinter as tk
import threading
import speech_recognition as sr
import pyttsx3
import wikipedia
import datetime
import os
import speech_recognition as sr

print("Available Microphones:")
for index, name in enumerate(sr.Microphone.list_microphone_names()):
    print(f"{index}: {name}")


# Initialize voice engine
engine = pyttsx3.init()
engine.setProperty("rate", 150)

def speak(text):
    engine.say(text)
    engine.runAndWait()

# Voice input function
def take_command():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        status_label.config(text="Listening...")
        r.adjust_for_ambient_noise(source)
        try:
            audio = r.listen(source, timeout=5)
            query = r.recognize_google(audio)
            return query.lower()
        except:
            return "I couldn't understand that."

# Response logic (same as Adam-style)
def process_command(command):
    if "time" in command:
        return datetime.datetime.now().strftime("It's %I:%M %p")

    elif "date" in command:
        return datetime.datetime.now().strftime("Today is %A, %B %d, %Y")

    elif "wikipedia" in command:
        topic = command.replace("wikipedia", "").strip()
        try:
            return wikipedia.summary(topic, sentences=2)
        except:
            return "I couldn't find anything on Wikipedia."

    elif "open google" in command:
        os.system("xdg-open https://www.google.com")
        return "Opening Google."

    elif "open youtube" in command:
        os.system("xdg-open https://www.youtube.com")
        return "Opening YouTube."

    elif "exit" in command or "quit" in command:
        return "Goodbye!"

    return "I'm not sure how to help with that."

# Logic that glues everything together
def run_aeris():
    user_query = take_command()
    chat_log.insert(tk.END, f"You: {user_query}\n")
    response = process_command(user_query)
    chat_log.insert(tk.END, f"Aeris: {response}\n\n")
    speak(response)

    if "goodbye" in response.lower():
        root.quit()

# Run in background so UI stays responsive
def start_listening():
    status_label.config(text="Ready...")
    threading.Thread(target=run_aeris).start()

# GUI setup
root = tk.Tk()
root.title("Aeris - Voice Assistant")
root.geometry("500x600")
root.config(bg="#1c1c1e")

title = tk.Label(root, text="Aeris Voice Assistant", font=("Helvetica", 18), fg="white", bg="#1c1c1e")
title.pack(pady=10)

chat_log = tk.Text(root, height=25, width=60, bg="#2c2c2e", fg="white", font=("Helvetica", 12))
chat_log.pack(padx=10, pady=10)

listen_button = tk.Button(root, text="🎤 Talk to Aeris", font=("Helvetica", 14), bg="#007AFF", fg="white", command=start_listening)
listen_button.pack(pady=10)

status_label = tk.Label(root, text="Status: Idle", font=("Helvetica", 12), fg="gray", bg="#1c1c1e")
status_label.pack()

root.mainloop()
