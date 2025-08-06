package com.healthapp.backend;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.factory.annotation.Value;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;
import org.json.JSONObject;
import java.io.IOException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")

public class DocumentController {

    @Value("${OPENAI_API_KEY}")
    private String openaiApiKey;

    @PostMapping(value = "/upload", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No file uploaded");
        }
        String extractedText;
        try {
            Tika tika = new Tika();
            extractedText = tika.parseToString(file.getInputStream());
        } catch (IOException | TikaException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to extract text from document");
        }

        // Prepare prompt for LLM
        String prompt = "Extract the following fields from this document and return as JSON with the following structure: " +
                "{\n  'First Name': string,\n  'Last Name': string,\n  'SSN': string,\n  'Income': string,\n  'Deductions': string,\n  'Spouse': { 'First Name': string, 'Last Name': string, 'SSN': string },\n  'Dependents': [ { 'First Name': string, 'Last Name': string, 'SSN': string, 'Relationship': string, 'Age': string } ]\n}" +
                "\nIf any field is missing, leave it blank. Document:\n" + extractedText;

        // Call OpenAI API (replace YOUR_OPENAI_API_KEY with your actual key)
        if (openaiApiKey == null || openaiApiKey.isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("OpenAI API key not set");
        }
        RestTemplate restTemplate = new RestTemplate();
        String apiUrl = "https://api.openai.com/v1/chat/completions";
        JSONObject requestBody = new JSONObject();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.put("messages", new org.json.JSONArray()
            .put(new JSONObject().put("role", "user").put("content", prompt)));
        requestBody.put("max_tokens", 256);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);

        org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(requestBody.toString(), headers);
        String llmResponse;
        try {
            org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("LLM API error: " + response.getBody());
            }
            JSONObject respJson = new JSONObject(response.getBody());
            llmResponse = respJson.getJSONArray("choices").getJSONObject(0).getJSONObject("message").getString("content");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error calling LLM: " + e.getMessage());
        }

        // Try to parse the LLM response as JSON
        try {
            JSONObject fields = new JSONObject(llmResponse);
            return ResponseEntity.ok(fields.toString());
        } catch (Exception e) {
            // If not valid JSON, just return the raw response
            return ResponseEntity.ok(llmResponse);
        }
    }
}
