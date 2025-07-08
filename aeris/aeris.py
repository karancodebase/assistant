import speech_recognition as sr
import pyttsx3
import datetime
import webbrowser
import wikipedia
import os
import smtplib

# Initialize the TTS engine
engine = pyttsx3.init()
engine.setProperty("rate", 150)

def speak(text):
    print("Assistant:", text)
    engine.say(text)
    engine.runAndWait()

def greet_user():
    hour = datetime.datetime.now().hour
    if 5 <= hour < 12:
        speak("Good morning!")
    elif 12 <= hour < 17:
        speak("Good afternoon!")
    else:
        speak("Good evening!")
    speak("I'm Aeris . What can I do for you today?")

def take_command():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        r.pause_threshold = 1
        try:
            audio = r.listen(source, timeout=5)
            query = r.recognize_google(audio)
            print(f"You said: {query}")
            return query.lower()
        except sr.UnknownValueError:
            speak("I didn't catch that. Please repeat.")
            return ""
        except:
            speak("Sorry, I had trouble hearing you.")
            return ""

def send_email(to_address, content):
    # Replace with your actual email and app password (use environment variables for safety)
    your_email = "youremail@gmail.com"
    your_password = "yourapppassword"
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(your_email, your_password)
        server.sendmail(your_email, to_address, content)
        server.quit()
        speak("Email has been sent successfully.")
    except Exception as e:
        speak("I couldn't send the email. Please check the credentials.")
        print(e)

def play_music(music_dir):
    try:
        songs = os.listdir(music_dir)
        if songs:
            os.startfile(os.path.join(music_dir, songs[0]))
            speak("Playing music.")
        else:
            speak("No music found in the directory.")
    except:
        speak("Unable to access music folder.")

def process_command(command):
    if "time" in command:
        time_str = datetime.datetime.now().strftime("%I:%M %p")
        speak(f"The current time is {time_str}")

    elif "date" in command:
        date_str = datetime.datetime.now().strftime("%A, %B %d, %Y")
        speak(f"Today is {date_str}")

    elif "wikipedia" in command:
        speak("Searching Wikipedia...")
        topic = command.replace("wikipedia", "").strip()
        try:
            summary = wikipedia.summary(topic, sentences=2)
            speak(summary)
        except:
            speak("Sorry, I couldn't find that on Wikipedia.")

    elif "open google" in command:
        webbrowser.open("https://www.google.com")
        speak("Opening Google.")

    elif "open youtube" in command:
        webbrowser.open("https://www.youtube.com")
        speak("Opening YouTube.")

    elif "play music" in command:
        music_folder = "C:\\Users\\YourUsername\\Music"  # Update path to your folder
        play_music(music_folder)

    elif "send email" in command:
        speak("What should I say?")
        content = take_command()
        speak("Who should I send it to?")
        to = input("Enter email address: ")
        send_email(to, content)

    elif "who are you" in command or "what can you do" in command:
        speak("I am Aeris your personal assistant. I can tell the time, date, play music, search Wikipedia, send emails, and more!")

    elif "open notepad" in command:
        os.system("notepad")

    elif "open calculator" in command:
        os.system("calc")

    elif "exit" in command or "quit" in command:
        speak("Goodbye! Have a great day.")
        exit()

    else:
        speak("I'm not sure how to help with that.")

if __name__ == "__main__":
    greet_user()
    while True:
        command = take_command()
        if command:
            process_command(command)