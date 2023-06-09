<!-- Previous badges -->
<!-- [![Issues][issues-shield]][issues-url]

[![Stargazers][stars-shield]][stars-url] -->

# WriteToPdf

<!-- New badges -->
<!--![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/COS301-SE-2023/WriteToPdf) -->
[![codecov](https://codecov.io/gh/COS301-SE-2023/WriteToPdf/branch/main/graph/badge.svg?token=2CELOVRCM3)](https://codecov.io/gh/COS301-SE-2023/WriteToPdf)
[![Build](https://github.com/COS301-SE-2023/WriteToPdf/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/COS301-SE-2023/WriteToPdf/actions/workflows/build.yml)
[![Test Backend](https://github.com/COS301-SE-2023/WriteToPdf/actions/workflows/test-backend.yml/badge.svg?branch=main)](https://github.com/COS301-SE-2023/WriteToPdf/actions/workflows/test-backend.yml)
[![Test Integration](https://github.com/COS301-SE-2023/WriteToPdf/actions/workflows/test-integration.yml/badge.svg?branch=main)](https://github.com/COS301-SE-2023/WriteToPdf/actions/workflows/test-integration.yml)
[![CodeQL](https://github.com/COS301-SE-2023/WriteToPdf/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/COS301-SE-2023/WriteToPdf/actions/workflows/codeql-analysis.yml)  
![GitHub issues](https://img.shields.io/github/issues/COS301-SE-2023/WriteToPdf)
[![Issues closed](https://img.shields.io/github/issues-closed/COS301-SE-2023/WriteToPdf?color=blue)](https://github.com/COS301-SE-2023/WriteToPdf/issues?q=is%3Aissue+is%3Aclosed)
[![Commits](https://img.shields.io/github/commit-activity/w/COS301-SE-2023/WriteToPdf)](https://github.com/COS301-SE-2023/WriteToPdf/issues)
<!-- [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=COS301-SE-2023_WriteToPdf&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=COS301-SE-2023_WriteToPdf) -->
<!-- [![Requirements Status](https://requires.io/github/COS301-SE-2023/WriteToPdf/requirements.svg?branch=main)](https://requires.io/github/COS301-SE-2023/WriteToPdf/requirements/?branch=main) -->
<!-- [![CodeQL](https://github.com/COS301-SE-2023/WriteToPdf/actions/workflows/codeql-analysis.yml/badge.svg?branch=main)](https://github.com/COS301-SE-2023/WriteToPdf/actions/workflows/codeql-analysis.yml) -->

<div align="center"><img src="https://github.com/COS301-SE-2023/WriteToPdf/assets/104741835/c151ddb6-fc79-4366-87ea-f91a033dfe10" /></div>


## Description

WriteToPdf is a user-friendly ecosystem that enables the conversion of handwritten notes into structured documents that can be edited and shared with others.

## Demos
- [Demo 1](https://drive.google.com/drive/folders/1D8awdHGBDuI7PGQYF_jtX9iGq_9PWY3x?usp=sharing)
- [Demo 2](https://drive.google.com/drive/folders/1QVIrOEi5PJAhG8DMwNrwjIcF7Gocu8LK?usp=sharing)

## Documentation
### Software requirements specification
- [SRS v1](https://docs.google.com/document/d/1eXRBaujvePMya_IDnRlOymDTWH2KdxSV1RGHm0_erwY/edit?usp=sharing)
- [SRS v2](https://docs.google.com/document/d/196IHwe8rBytZlJOIvh8gGMJUIhs1joQ91NA5TIrqbV4/edit?usp=sharing)

### Architecture
- [Architecture v1](https://docs.google.com/document/d/1skoEPk1VvtO8P9fyWIVFyUuf0ssU1aI8G-wrYYNbeyg/edit?usp=sharing)

### User Manual
- [User manual v1](https://docs.google.com/document/d/1zUkgP6SMe9ti3cEWSjjO4yTOUCb1NZnV1_J4SeadA7A/edit?usp=sharing)

### Coding standards
- [Coding standards](https://github.com/COS301-SE-2023/WriteToPdf/wiki/Coding-Standards)

### Member contributions
- [Member contributions](https://docs.google.com/document/d/14n7aEG_Lwh3dXSq6ltJ8XE_rzAREMGsH-3B-crGn2fM/edit?usp=sharing)

## Tech Stack

<a href="https://angular.io">
    <img alt="Angular" src="https://img.shields.io/badge/angular-dd0031?style=for-the-badge&logo=angular&logoColor=white" />
</a>


<a href="https://primeng.org/">
    <img alt="Angular" src="https://img.shields.io/badge/primeng-dd0031?style=for-the-badge&logo=primeng&logoColor=white" />
</a>

<a href="https://nestjs.com/">
  <img alt="NestJS" src="https://img.shields.io/badge/nestjs-e0234e?style=for-the-badge&logo=nestjs&logoColor=white" />
</a>

<a href="https://aws.amazon.com/ec2/">
  <img alt="AWS EC2" src="https://img.shields.io/badge/amazon%20ec2-dd700f?style=for-the-badge&logo=aws&logoColor=white" />
</a>

<a href="https://mariadb.org/">
  <img alt="MARIADB" src="https://img.shields.io/badge/mariadb-142958?style=for-the-badge&logo=mariadb&logoColor=white" />
</a>

## Organisation & Management
We use <a href="https://github.com/COS301-SE-2023/WriteToPdf/issues">Github Issues</a> and <a href="https://github.com/COS301-SE-2023/WriteToPdf/projects?query=is%3Aopen">Github Projects</a> to organise our team, with different members being assigned to specific tasks to ensure effective use of each member’s time. 


## Repository Structure
The repository follows a well-organized structure to meet our client's requirements and ensure efficient development and maintenance. It consists of the following folders:
```
.
|-- /frontend
|-- /backend
|-- /infrastructure
```

The `frontend` folder holds all the code related to the user-facing interface and the client-side functionality. This includes HTML, CSS, JavaScript, and any relevant assets.

The `backend` folder contains the server-side code responsible for handling data processing, business logic, and integration with external services. This includes server-side programming languages, frameworks, and libraries.

To address the need for infrastructure as code, the `infrastructure` folder houses all the necessary configurations and scripts for provisioning and managing the underlying infrastructure components. This allows for automated and reproducible deployment and scaling of the application.

By structuring the repository in this manner, we maintain a clear separation of concerns, enabling efficient collaboration and ease of maintenance across different parts of the project.

## Team Members
<details>
<summary>Janco Spies - u21434159</summary>
<br>
<p>Project Leader, Tester</p>
<p>
Janco has experience working as a tutor for the module Data Structures and Algorithms at the University of Pretoria, where he enjoys problem-solving and collaborating with others. Janco has excelled academically during his time at the university and has a strong background in statistics. He is skilled in several programming languages and frameworks, including Java, NodeJS, C++, Angular, and Python.
</p>
<img src="https://user-images.githubusercontent.com/104741835/235907674-681152ec-0f46-4b1d-8c3b-4478a2e6290e.png" />
<br/>
<a href="https://www.linkedin.com/in/ACoAADDlAbMBzAMuf8KIqa4ZdJtrDAi1qu4EPz4?lipi=urn%3Ali%3Apage%3Ad_flagship3_feed%3B1J9zjGT%2FSHeIpMlnKxWZvA%3D%3D">
<img src="https://img.shields.io/badge/linkedin-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white" alt="Linkedin"/>
</a>
 
  <a href="https://github.com/JanSpies82">
<img src="https://img.shields.io/badge/github-161b22?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a>
 
</details>


<details>
<summary>Jake Weatherhead - u04929552</summary>
<br/>
<p>Database Engineer, Integration Engineer</p>
<p>
Jake is a self-motivated and passionate individual who is highly enthusiastic about the practical applications of data science, machine learning and product design. He has experience as a tutor for the module Mathematical Modelling at the University of Pretoria where he tutors students in Pythonic data science. He has experience building, managing and integrating NoSQL databases, such as Google Cloud Firestore and MongoDB. He also has experience building APIs in PHP and Typescript through NestJS. Jake’s other relevant skills include Java, NodeJS, Angular, C++ and LaTeX.
</p>
<img src="https://user-images.githubusercontent.com/104741835/235907757-81df79c3-b9e8-49ae-a481-c21bbb385913.png" />
<br/>
<a href="https://www.linkedin.com/in/ACoAADrYSskBc41A9bb97Sym87rcIbAqpKdQOY4/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BmboD%2FrmkRsKFxJTOheSOsQ%3D%3D">
<img src="https://img.shields.io/badge/linkedin-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white" alt="Linkedin"/>
</a>
 
  <a href="https://github.com/jakeweatherhead">
<img src="https://img.shields.io/badge/github-161b22?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a>
 
</details>


<details>
<summary>Dylan Kapnias - u18108467</summary>
<br/>
<p>Integration Engineer, DevOps</p>
<p>
Dylan is a highly motivated individual with a solid academic background, finishing the second half of his 3rd year with a 75% average. He is proficient in a wide range of technologies, including: Python, C++, Java, ASM, JavaScript/TypeScript, Rust, PHP, Angular, NodeJS, Jest, and Cypress. His experience extends to tools and platforms such as Docker, Home Server maintenance, LaTeX, Doxygen, Google Cloud, and CI/CD workflows using GitHub Actions. Dylan is passionate about applying his technical expertise in diverse projects and environments, and he is always eager to learn and adopt new technologies.
</p>
<img src="https://user-images.githubusercontent.com/104741835/235907809-53427a24-eb95-4ebc-8e3f-1fa38d514741.png" />
<br/>
<a href="https://www.linkedin.com/in/dylan-kapnias-b41ab2277?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BDLZJVIFfQUyfGT%2FfBspbpg%3D%3D">
<img src="https://img.shields.io/badge/linkedin-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white" alt="Linkedin"/>
</a>
 
  <a href="https://github.com/dylankapnias-uni">
<img src="https://img.shields.io/badge/github-161b22?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a>
 
</details>


<details>
<summary>Conrad Strasheim - u04483716</summary>
<br/>
<p>Business Analyst, Services Engineer</p>
<p>
Conrad is an avid programmer, yogi and musician. He has experience in Python, R, MATLAB, C++, Java, Angular, React, Google Cloud and Docker. He has programmed an algorithmic music generator, whose music functions as accompaniment for musical improvisation, with Python as part of a master’s project collaboration at Tuks. His speciality is reading up on domain specific knowledge and implementing innovative solutions within that domain, as with the music application.
</p>
<img src="https://user-images.githubusercontent.com/104741835/235907780-ec7959e3-e747-4264-a2f4-60244e0212ab.png" />
<br/>
<a href="https://www.linkedin.com/in/conrad-strasheim-81810a26a?miniProfileUrn=urn%3Ali%3Afs_miniProfile%3AACoAAEHeNBQBIAgklS52yGZGLqg_dsFeSpaTy84&lipi=urn%3Ali%3Apage%3Ad_flagship3_search_srp_all%3BIrFwHOqPRhixjO%2F3SKDhWA%3D%3D">
<img src="https://img.shields.io/badge/linkedin-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white" alt="Linkedin"/>
</a>
 
  <a href="https://github.com/ConradStras">
<img src="https://img.shields.io/badge/github-161b22?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a>
 
</details>


<details >
<summary>Julian Pienaar - u21599892</summary>
<br/>
<p>UI Engineer, Designer</p>

<p>
Julian has experience with design patterns and data structures giving him a good understanding of algorithms. He has worked on large Angular projects as a UI Engineer. He has a high capacity to learn and understand complex ideas and is able to adapt to the change. He is proficient in multiple languages and frameworks such as C++, Java, NodeJS, Php, Javascript, Ionic,  Angular and Typescript. 
</p>

<img src="https://user-images.githubusercontent.com/104741835/235907734-cc6ce2a7-ac9a-4d3c-9dfe-03eb772b4b98.png" /> 
<br/>
<a href="https://www.linkedin.com/in/julian-pienaar-370208271/?lipi=urn%3Ali%3Apage%3Ad_flagship3_feed%3B0NeumpYtT8e%2FsXo8GIBScQ%3D%3D">
<img src="https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white" alt="Linkedin"/>
</a>
 
 <a href="https://github.com/JulianPienaar">
<img src="https://img.shields.io/badge/github-161b22?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a>
 
</details>

<!-- Badge links & images -->
[issues-shield]: https://img.shields.io/github/issues/COS301-SE-2023/WriteToPdf.svg?style=for-the-badge
[issues-url]: https://github.com/COS301-SE-2023/WriteToPdf/issues
[stars-shield]: https://img.shields.io/github/stars/COS301-SE-2023/WriteToPdf.svg?style=for-the-badge
[stars-url]: ttps://github.com/COS301-SE-2023/WriteToPdf/stargazers
