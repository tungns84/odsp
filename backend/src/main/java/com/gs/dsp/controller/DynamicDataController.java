package com.gs.dsp.controller;

import com.gs.dsp.shared.kernel.constants.AppConstants;
import com.gs.dsp.shared.kernel.constants.FieldNames;
import com.gs.dsp.dataaccess.domain.model.DataEndpointId;
import com.gs.dsp.dataaccess.infrastructure.query.DynamicQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/data")
public class DynamicDataController {

    private final DynamicQueryService dynamicQueryService;

    public DynamicDataController(DynamicQueryService dynamicQueryService) {
        this.dynamicQueryService = dynamicQueryService;
    }

    @GetMapping("/{dataEndpointId}")
    public ResponseEntity<Object> queryDynamicData(
            @PathVariable UUID dataEndpointId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            List<Map<String, Object>> result = dynamicQueryService.executeQuery(new DataEndpointId(dataEndpointId), page, size);
            return ResponseEntity.ok(Map.of(
                    "meta", Map.of("page", page, "size", size),
                    "data", result
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(FieldNames.ERROR, e.getMessage()));
        }
    }
}
