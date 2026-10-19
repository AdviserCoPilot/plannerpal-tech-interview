package com.atlas.academy.model;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "parents")
public class Parent {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "email")
    private String email;

    @Column(name = "name")
    private String name;

    public Parent() {}

    public Parent(UUID id, String email, String name) {
        this.id = id;
        this.email = email;
        this.name = name;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
