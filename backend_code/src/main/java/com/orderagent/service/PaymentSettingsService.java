package com.orderagent.service;

import com.orderagent.dto.PaymentInfoResponse;
import com.orderagent.dto.PaymentSettingsRequest;
import com.orderagent.exception.BadRequestException;
import com.orderagent.exception.ResourceNotFoundException;
import com.orderagent.model.PaymentSettings;
import com.orderagent.model.User;
import com.orderagent.repository.PaymentSettingsRepository;
import com.orderagent.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentSettingsService {

    // Only real image data URLs: the value is rendered as <img src>, never as HTML.
    private static final Pattern IMAGE_PREFIX = Pattern.compile("^data:image/(png|jpeg|webp);base64,");

    private final PaymentSettingsRepository repository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PaymentInfoResponse get() {
        return PaymentInfoResponse.fromEntity(repository.findById(PaymentSettings.SINGLETON_ID).orElseGet(PaymentSettings::new));
    }

    public PaymentInfoResponse update(UUID adminId, PaymentSettingsRequest request) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminId));

        String qr = request.getQrImage();
        if (qr != null && !qr.isEmpty() && !IMAGE_PREFIX.matcher(qr).find()) {
            throw new BadRequestException("qrImage must be a PNG, JPEG or WebP data URL");
        }

        PaymentSettings s = repository.findById(PaymentSettings.SINGLETON_ID).orElseGet(PaymentSettings::new);
        s.setQrImage(qr == null || qr.isEmpty() ? null : qr);
        s.setInstructions(request.getInstructions() == null || request.getInstructions().isBlank() ? null : request.getInstructions().trim());
        s.setExchangeRate(request.getExchangeRate());
        s.setUpdatedAt(LocalDateTime.now());
        s.setUpdatedBy(admin.getName());
        repository.save(s);
        return PaymentInfoResponse.fromEntity(s);
    }
}
