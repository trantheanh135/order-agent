package com.orderagent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatSendRequest {

    @NotBlank(message = "content is required")
    @Size(max = 2000, message = "content must be at most 2000 characters")
    private String content;
}
