package com.dhanvikk.blooms

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.Locale

class DhanvikkSpeechModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener, RecognitionListener {

    private var speechRecognizer: SpeechRecognizer? = null
    private val mainHandler = Handler(Looper.getMainLooper())
    private var isListening = false
    private var pendingGoogleSpeechPromise: Promise? = null

    companion object {
        private const val REQUEST_GOOGLE_SPEECH_CODE = 4192
    }

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return "DhanvikkSpeechModule"
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        try {
            if (reactContext.hasActiveReactInstance()) {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(eventName, params)
            }
        } catch (_: Exception) {}
    }

    @ReactMethod
    fun isRecognitionAvailable(promise: Promise) {
        try {
            val available = SpeechRecognizer.isRecognitionAvailable(reactContext)
            promise.resolve(available)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun isGoogleVoiceSearchAvailable(promise: Promise) {
        try {
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
            val activities = reactContext.packageManager.queryIntentActivities(intent, 0)
            promise.resolve(activities.isNotEmpty())
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun startGoogleVoiceSearch(prompt: String?, promise: Promise) {
        mainHandler.post {
            try {
                val activity = reactContext.currentActivity
                if (activity == null) {
                    promise.reject("NO_ACTIVITY", "Current Android activity is not available")
                    return@post
                }

                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(
                        RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                        RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
                    )
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
                    putExtra(
                        RecognizerIntent.EXTRA_PROMPT,
                        prompt ?: "Speak to search flowers, bouquets, or occasions…"
                    )
                    putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5)
                }

                pendingGoogleSpeechPromise = promise
                activity.startActivityForResult(intent, REQUEST_GOOGLE_SPEECH_CODE)
            } catch (e: ActivityNotFoundException) {
                pendingGoogleSpeechPromise = null
                promise.reject(
                    "GOOGLE_VOICE_NOT_FOUND",
                    "Google Voice Search is not installed or enabled on this device"
                )
            } catch (e: Exception) {
                pendingGoogleSpeechPromise = null
                promise.reject(
                    "GOOGLE_VOICE_ERROR",
                    e.message ?: "Failed to start Google Voice Search"
                )
            }
        }
    }

    @ReactMethod
    fun startListening(language: String?, promise: Promise) {
        mainHandler.post {
            try {
                if (!SpeechRecognizer.isRecognitionAvailable(reactContext)) {
                    promise.reject(
                        "SPEECH_NOT_AVAILABLE",
                        "Speech recognition service is not available on this device"
                    )
                    return@post
                }

                if (speechRecognizer == null) {
                    speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext)
                    speechRecognizer?.setRecognitionListener(this)
                } else {
                    speechRecognizer?.cancel()
                }

                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(
                        RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                        RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
                    )
                    putExtra(
                        RecognizerIntent.EXTRA_LANGUAGE,
                        language ?: Locale.getDefault().toLanguageTag()
                    )
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                    putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5)
                }

                speechRecognizer?.startListening(intent)
                isListening = true
                promise.resolve(true)
            } catch (e: Exception) {
                isListening = false
                promise.reject("START_ERROR", e.message ?: "Failed to start speech recognition")
            }
        }
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        mainHandler.post {
            try {
                speechRecognizer?.stopListening()
                isListening = false
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("STOP_ERROR", e.message ?: "Failed to stop listening")
            }
        }
    }

    @ReactMethod
    fun cancelListening(promise: Promise) {
        mainHandler.post {
            try {
                speechRecognizer?.cancel()
                isListening = false
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("CANCEL_ERROR", e.message ?: "Failed to cancel listening")
            }
        }
    }

    @ReactMethod
    fun destroy(promise: Promise) {
        mainHandler.post {
            try {
                speechRecognizer?.destroy()
                speechRecognizer = null
                isListening = false
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("DESTROY_ERROR", e.message ?: "Failed to destroy speech recognizer")
            }
        }
    }

    // ActivityEventListener for Google Voice Search Intent
    override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        if (requestCode == REQUEST_GOOGLE_SPEECH_CODE) {
            val promise = pendingGoogleSpeechPromise
            pendingGoogleSpeechPromise = null

            if (resultCode == Activity.RESULT_OK && data != null) {
                val results = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
                val recognizedText = results?.firstOrNull() ?: ""

                val map = Arguments.createMap()
                val array = Arguments.createArray()
                results?.forEach { array.pushString(it) }
                map.putArray("results", array)
                map.putString("text", recognizedText)
                sendEvent("onSpeechResults", map)

                promise?.resolve(recognizedText)
            } else if (resultCode == Activity.RESULT_CANCELED) {
                promise?.reject("CANCELLED", "Google Voice Search cancelled by user")
            } else {
                promise?.reject("FAILED", "Google Voice Search ended with code $resultCode")
            }
        }
    }

    override fun onNewIntent(intent: Intent) {}

    // RecognitionListener callbacks
    override fun onReadyForSpeech(params: Bundle?) {
        val map = Arguments.createMap()
        sendEvent("onSpeechStart", map)
    }

    override fun onBeginningOfSpeech() {
        val map = Arguments.createMap()
        sendEvent("onSpeechBegan", map)
    }

    override fun onRmsChanged(rmsdB: Float) {
        val map = Arguments.createMap()
        map.putDouble("value", rmsdB.toDouble())
        sendEvent("onSpeechVolume", map)
    }

    override fun onBufferReceived(buffer: ByteArray?) {}

    override fun onEndOfSpeech() {
        val map = Arguments.createMap()
        sendEvent("onSpeechEnd", map)
    }

    override fun onError(error: Int) {
        val map = Arguments.createMap()
        val errorMsg = when (error) {
            SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
            SpeechRecognizer.ERROR_CLIENT -> "Client error"
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient microphone permission"
            SpeechRecognizer.ERROR_NETWORK -> "Network connection required for voice recognition"
            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
            SpeechRecognizer.ERROR_NO_MATCH -> "No speech match detected. Try again"
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Speech recognizer busy"
            SpeechRecognizer.ERROR_SERVER -> "Server error"
            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech detected"
            else -> "Speech recognition error code: $error"
        }
        map.putInt("code", error)
        map.putString("message", errorMsg)
        sendEvent("onSpeechError", map)
    }

    override fun onResults(results: Bundle?) {
        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val map = Arguments.createMap()
        val array = Arguments.createArray()
        matches?.forEach { array.pushString(it) }
        map.putArray("results", array)
        if (!matches.isNullOrEmpty()) {
            map.putString("text", matches[0])
        }
        sendEvent("onSpeechResults", map)
    }

    override fun onPartialResults(partialResults: Bundle?) {
        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val map = Arguments.createMap()
        val array = Arguments.createArray()
        matches?.forEach { array.pushString(it) }
        map.putArray("results", array)
        if (!matches.isNullOrEmpty()) {
            map.putString("text", matches[0])
        }
        sendEvent("onSpeechPartialResults", map)
    }

    override fun onEvent(eventType: Int, params: Bundle?) {}
}
