# Autoflex – Automotive Service Finder Platform

This is a functional prototype for the **AutoFlex** web application, a modern platform aiming to centralize and facilitate the discovery of automotive services in Romania.

---

## 🎓 Academic Context

This project was developed for the **Applied Informatics** course.

* **Author:** Balasa Emilian–Valentin
* **Specialization:** FILS – CTI (English)
* **Coordinating Teacher:** sl. dr. ing. Mitrea Dan Alexandru

---

## 🚀 Live Demo

You can view the live prototype, hosted on GitHub Pages, here:

**[View Demo](https://emilianbalasa.github.io/AutoFlex)**

---

## 🎯 Project Objectives

The main objective is to fill a gap in the Romanian market by creating a unique platform where clients can find and evaluate auto services.

* **Centralization:** Creating a centralized platform for service discovery.
* **Provider Profiles:** Allowing service providers to showcase their services in detail.
* **Easy Search:** Implementing a search system based on name, location, or service.
* **Adapting a Successful Model:** The project adapts the concept of booking applications (like MERO) to the specific automotive niche.

## 🛠️ Technologies Used

* **HTML:** For structuring the web pages.
* **CSS:** For styling and responsive layout.
* **JavaScript:** For interactivity and dynamic content.
* **Firebase:** Used as a real-time database (Firestore) for storing data.
* **PHP:** Used minimally for certain backend logic.

## 🔒 Important Note: Security and Demo Limitations

This project is configured as a **public, read-only prototype**.

To protect the database integrity, **strict Security Rules** have been implemented in Google Firebase.

> **What this means:**
>
> * **You CAN VIEW:** You can browse the site and see all data (services, providers, etc.), as the rules permit `read` operations.
> * **You CANNOT WRITE:** Any `write` operation (create, update, delete) is **completely blocked** at the server level (`allow write: if false;`).
>
> Therefore, features like **account creation**, **login**, and **form submission** are **intentionally disabled** in this public demo.

## 🏁 Conclusion and Future Work

This prototype demonstrates a clean and intuitive UI, focused on service discovery.

Planned future features include:
* Implementing a **rating system**
* Adding an **online booking system**
* Introducing **advanced search filters**
