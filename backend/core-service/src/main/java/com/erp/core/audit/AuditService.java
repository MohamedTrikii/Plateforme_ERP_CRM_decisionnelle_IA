package com.erp.core.audit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * AuditService – records every state-changing operation asynchronously.
 *
 * Usage in any service:
 *   auditService.log("Customer", id, "CREATE", oldObj, newObj);
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper       objectMapper;

    /**
     * Log an audit event.
     *
     * @param entityName  class name of the modified entity
     * @param entityId    primary key of the modified record
     * @param action      CREATE | UPDATE | DELETE | CONFIG_CHANGE
     * @param oldValue    object state before the change (null for CREATE)
     * @param newValue    object state after the change (null for DELETE)
     * @param tenantId    tenant performing the operation
     */
    @Async  // Non-blocking – audit writing does not slow down the main flow
    public void log(String entityName,
                    String entityId,
                    String action,
                    Object oldValue,
                    Object newValue,
                    String tenantId) {

        String performedBy = getCurrentUsername();

        AuditLog entry = AuditLog.builder()
                .entityName(entityName)
                .entityId(entityId)
                .action(action)
                .performedBy(performedBy)
                .tenantId(tenantId)
                .oldValue(toJson(oldValue))
                .newValue(toJson(newValue))
                .description(buildDescription(action, entityName, entityId, performedBy))
                .build();

        auditLogRepository.save(entry);
        log.debug("Audit recorded: {} {} {} by {}", action, entityName, entityId, performedBy);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null) ? auth.getName() : "system";
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.warn("Could not serialize audit value: {}", e.getMessage());
            return obj.toString();
        }
    }

    private String buildDescription(String action, String entity,
                                    String id, String user) {
        return String.format("%s performed %s on %s[id=%s]", user, action, entity, id);
    }
}
