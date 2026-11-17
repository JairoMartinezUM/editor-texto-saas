package com.example.editor_texto_sass.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.editor_texto_sass.model.Documento;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {

}
