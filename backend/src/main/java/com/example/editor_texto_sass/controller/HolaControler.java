package com.example.editor_texto_sass.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HolaControler {

    @GetMapping("/api/status")
    public String estado() {
        return "Editor de texto SASS funcionando correctamente";
    }

}
