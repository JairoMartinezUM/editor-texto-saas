package com.example.editor_texto_sass.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Documento {
    //ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //Titulo
    private String titulo;

    //Contenido
    @Column(columnDefinition = "TEXT")
    private String contenido;

    //Autor
    private String autor;

    //Fecha de creación
    private LocalDateTime fechaCreacion;
    //Fecha de Modificación
    private LocalDateTime fechaModificacion;

    //constructor
    public Documento() {
    }

    //Getters y Setters
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}

    public String getTitulo() {return titulo;}
    public void setTitulo(String titulo) {this.titulo = titulo;}
    
    public String getContenido() {return contenido;}
    public void setContenido(String contenido) {this.contenido = contenido;}
    
    public String getAutor() {return autor;}
    public void setAutor(String autor) {this.autor = autor;}
    
    public LocalDateTime getFechaCreacion() {return fechaCreacion;}
    public void setFechaCreacion(LocalDateTime f) {this.fechaCreacion = f;}
    
    public LocalDateTime getFechaModificacion() {return fechaModificacion;}
    public void setFechaModificacion(LocalDateTime f) {this.fechaModificacion = f;}
}   
