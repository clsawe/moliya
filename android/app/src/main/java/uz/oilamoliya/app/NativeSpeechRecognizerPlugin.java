package uz.oilamoliya.app;

import android.Manifest;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.ArrayList;

@CapacitorPlugin(
    name = "NativeSpeechRecognizer",
    permissions = {
        @Permission(
            alias = "microphone",
            strings = { Manifest.permission.RECORD_AUDIO }
        )
    }
)
public class NativeSpeechRecognizerPlugin extends Plugin {
    private SpeechRecognizer speechRecognizer = null;
    private boolean isListening = false;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    @PluginMethod
    public void isAvailable(PluginCall call) {
        boolean available = SpeechRecognizer.isRecognitionAvailable(getContext());
        JSObject ret = new JSObject();
        ret.put("available", available);
        call.resolve(ret);
    }

    @PluginMethod
    public void startListening(PluginCall call) {
        if (!SpeechRecognizer.isRecognitionAvailable(getContext())) {
            call.reject("Qurilmangizda Android Speech Recognition servisi mavjud emas.");
            return;
        }

        if (getPermissionState("microphone") != com.getcapacitor.PermissionState.GRANTED) {
            requestPermissionForAlias("microphone", call, "microphonePermissionCallback");
            return;
        }

        startRecognitionInternal(call);
    }

    @PermissionCallback
    private void microphonePermissionCallback(PluginCall call) {
        if (getPermissionState("microphone") == com.getcapacitor.PermissionState.GRANTED) {
            startRecognitionInternal(call);
        } else {
            notifySpeechError("Mikrofondan foydalanishga ruxsat berilmadi", SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS);
            call.reject("Mikrofon ruxsati berilmadi");
        }
    }

    private void startRecognitionInternal(PluginCall call) {
        String lang = call.getString("language", "uz-UZ");

        mainHandler.post(() -> {
            try {
                if (speechRecognizer != null) {
                    try {
                        speechRecognizer.destroy();
                    } catch (Exception ignored) {}
                    speechRecognizer = null;
                }

                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(getContext());
                if (speechRecognizer == null) {
                    call.reject("SpeechRecognizer yaratib bo‘lmadi");
                    return;
                }

                speechRecognizer.setRecognitionListener(new RecognitionListener() {
                    @Override
                    public void onReadyForSpeech(Bundle params) {
                        isListening = true;
                        notifyStateChange("ready");
                    }

                    @Override
                    public void onBeginningOfSpeech() {
                        notifyStateChange("listening");
                    }

                    @Override
                    public void onRmsChanged(float rmsdB) {}

                    @Override
                    public void onBufferReceived(byte[] buffer) {}

                    @Override
                    public void onEndOfSpeech() {
                        notifyStateChange("processing");
                    }

                    @Override
                    public void onError(int error) {
                        isListening = false;
                        String errorMessage = mapErrorCode(error);
                        notifySpeechError(errorMessage, error);
                    }

                    @Override
                    public void onResults(Bundle results) {
                        isListening = false;
                        if (results != null) {
                            ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if (matches != null && !matches.isEmpty()) {
                                String transcript = matches.get(0);
                                notifySpeechResult(transcript, true);
                                return;
                            }
                        }
                        notifySpeechError("Nutq aniqlanmadi (mos so‘z topilmadi)", SpeechRecognizer.ERROR_NO_MATCH);
                    }

                    @Override
                    public void onPartialResults(Bundle partialResults) {
                        if (partialResults != null) {
                            ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if (matches != null && !matches.isEmpty()) {
                                String transcript = matches.get(0);
                                notifySpeechResult(transcript, false);
                            }
                        }
                    }

                    @Override
                    public void onEvent(int eventType, Bundle params) {}
                });

                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, lang);
                intent.putExtra("android.speech.extra.EXTRA_ADDITIONAL_LANGUAGES", new String[]{lang, "uz"});
                intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
                intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getContext().getPackageName());

                speechRecognizer.startListening(intent);
                call.resolve();

            } catch (Exception e) {
                isListening = false;
                call.reject("Xatolik: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void stopListening(PluginCall call) {
        mainHandler.post(() -> {
            try {
                if (speechRecognizer != null && isListening) {
                    speechRecognizer.stopListening();
                }
            } catch (Exception ignored) {}
            isListening = false;
            call.resolve();
        });
    }

    private void notifySpeechResult(String transcript, boolean isFinal) {
        JSObject ret = new JSObject();
        ret.put("transcript", transcript);
        ret.put("isFinal", isFinal);
        notifyListeners("onSpeechResult", ret);
    }

    private void notifySpeechError(String error, int code) {
        JSObject ret = new JSObject();
        ret.put("error", error);
        ret.put("code", code);
        notifyListeners("onSpeechError", ret);
    }

    private void notifyStateChange(String state) {
        JSObject ret = new JSObject();
        ret.put("state", state);
        notifyListeners("onSpeechStateChange", ret);
    }

    private String mapErrorCode(int error) {
        switch (error) {
            case SpeechRecognizer.ERROR_AUDIO:
                return "Audio yozishda xatolik yuz berdi (ERROR_AUDIO)";
            case SpeechRecognizer.ERROR_CLIENT:
                return "Qurilma dasturida xatolik yuz berdi (ERROR_CLIENT)";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                return "Mikrofondan foydalanish ruxsati berilmadi (ERROR_INSUFFICIENT_PERMISSIONS)";
            case SpeechRecognizer.ERROR_NETWORK:
                return "Tarmoq xatoligi yuz berdi. Internet aloqasini tekshiring (ERROR_NETWORK)";
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT:
                return "Tarmoq kutilish vaqti tugadi (ERROR_NETWORK_TIMEOUT)";
            case SpeechRecognizer.ERROR_NO_MATCH:
                return "Nutq aniqlanmadi yoki mos kelmadi (ERROR_NO_MATCH)";
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY:
                return "Ovozni aniqlash xizmati band (ERROR_RECOGNIZER_BUSY)";
            case SpeechRecognizer.ERROR_SERVER:
                return "Server xatosi yuz berdi (ERROR_SERVER)";
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                return "Ovoz eshitilmadi, kutilish vaqti tugadi (ERROR_SPEECH_TIMEOUT)";
            case 12: // ERROR_LANGUAGE_NOT_SUPPORTED in Android API 33+
                return "O‘zbekcha ovozli tanish (uz-UZ) qurilma nutq servisi tomonidan qo‘llab-quvvatlanmaydi";
            case 13: // ERROR_LANGUAGE_UNAVAILABLE in Android API 33+
                return "O‘zbekcha til paketi hozirda mavjud emas";
            default:
                return "Nutqni aniqlashda xatolik yuz berdi (Kod: " + error + ")";
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (speechRecognizer != null) {
            try {
                speechRecognizer.destroy();
            } catch (Exception ignored) {}
            speechRecognizer = null;
        }
        super.handleOnDestroy();
    }
}
