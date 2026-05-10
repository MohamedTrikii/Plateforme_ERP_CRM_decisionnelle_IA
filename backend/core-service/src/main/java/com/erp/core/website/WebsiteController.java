package com.erp.core.website;

import com.erp.core.systemconfig.SystemConfig;
import com.erp.core.systemconfig.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * WebsiteController – serves all dynamic content for the public enterprise website.
 *
 * All endpoints are PUBLIC (no auth required). Content is loaded from SystemConfig
 * so the admin can update text, images and structure without code changes.
 *
 * Sections served:
 *   - hero    : headline, sub-headline, CTA button, background image
 *   - about   : company story, mission, vision, team photo
 *   - services: list of service cards (title, description, icon)
 *   - gallery : list of image URLs with captions
 *   - contact : address, phone, email, google maps embed URL
 *   - footer  : social links, copyright text, quick-links
 */
@RestController
@RequestMapping("/api/v1/website")
@RequiredArgsConstructor
public class WebsiteController {

    private final SystemConfigRepository configRepository;

    /**
     * Returns ALL public website config as a flat key→value map.
     * The Angular public module reads this once at startup.
     */
    @GetMapping("/content")
    public ResponseEntity<Map<String, String>> getContent(
            @RequestParam(defaultValue = "default") String tenantId) {

        List<SystemConfig> configs = configRepository.findByTenantId(tenantId);

        Map<String, String> content = configs.stream()
                .filter(c -> c.isPublic())
                .collect(Collectors.toMap(
                        SystemConfig::getConfigKey,
                        c -> c.getConfigValue() != null ? c.getConfigValue() : "",
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        return ResponseEntity.ok(content);
    }

    /**
     * Returns a named section as a structured map.
     * E.g. /api/v1/website/section/services returns all keys starting with "website.services."
     */
    @GetMapping("/section/{section}")
    public ResponseEntity<Map<String, String>> getSection(
            @PathVariable String section,
            @RequestParam(defaultValue = "default") String tenantId) {

        String prefix = "website." + section + ".";

        List<SystemConfig> configs = configRepository.findByTenantId(tenantId);

        Map<String, String> sectionData = configs.stream()
                .filter(c -> c.isPublic())
                .filter(c -> c.getConfigKey().startsWith(prefix))
                .collect(Collectors.toMap(
                        c -> c.getConfigKey().substring(prefix.length()),
                        c -> c.getConfigValue() != null ? c.getConfigValue() : "",
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        return ResponseEntity.ok(sectionData);
    }
}
