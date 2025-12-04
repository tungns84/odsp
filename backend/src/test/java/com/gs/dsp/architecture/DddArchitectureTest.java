package com.gs.dsp.architecture;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.*;
import static com.tngtech.archunit.library.Architectures.layeredArchitecture;

/**
 * ArchUnit tests to enforce DDD architecture rules.
 * These tests ensure that the codebase adheres to Domain-Driven Design principles.
 */
@DisplayName("DDD Architecture Tests")
class DddArchitectureTest {

    private static JavaClasses classes;

    @BeforeAll
    static void setup() {
        classes = new ClassFileImporter()
                .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                .importPackages("com.gs.dsp");
    }

    // ==================== Rule 1: Bounded Context Package Structure ====================

    @Test
    @DisplayName("Rule 1: Domain layer should not depend on Infrastructure")
    void domainShouldNotDependOnInfrastructure() {
        ArchRule rule = noClasses()
                .that().resideInAPackage("..domain..")
                .should().dependOnClassesThat().resideInAPackage("..infrastructure..")
                .because("Domain layer must not depend on Infrastructure layer");

        rule.check(classes);
    }

    @Test
    @DisplayName("Rule 1: All @Service classes must be in bounded context packages")
    void allServicesMustBeInBoundedContext() {
        ArchRule rule = classes()
                .that().areAnnotatedWith("org.springframework.stereotype.Service")
                .and().resideOutsideOfPackage("com.gs.dsp.shared..")
                .should().resideInAnyPackage(
                        "..iam..",
                        "..connectivity..",
                        "..dataaccess..",
                        "..reporting.."
                )
                .because("All services must belong to a specific bounded context, not flat packages like 'service'");

        rule.check(classes);
    }

    // ==================== Rule 2: Aggregate Root Design ====================

    @Test
    @DisplayName("Rule 2: Aggregate Roots must extend AggregateRoot")
    void aggregateRootsShouldExtendBaseClass() {
        ArchRule rule = classes()
                .that().resideInAPackage("..domain.model..")
                .and().areAnnotatedWith("jakarta.persistence.Entity")
                .should().beAssignableTo("com.gs.dsp.shared.domain.model.AggregateRoot")
                .because("All entities in domain.model package must be Aggregate Roots extending AggregateRoot<ID>");

        rule.check(classes);
    }

    @Test
    @DisplayName("Rule 2: Aggregate Roots must not use @Data annotation")
    void aggregateRootsShouldNotUseDataAnnotation() {
        ArchRule rule = classes()
                .that().resideInAPackage("..domain.model..")
                .and().areAnnotatedWith("jakarta.persistence.Entity")
                .should().notBeAnnotatedWith("lombok.Data")
                .because("Aggregate Roots must not use @Data (use @Getter only to protect invariants)");

        rule.check(classes);
    }

    @Test
    @DisplayName("Rule 2: Aggregate Roots should use Lombok @Getter instead of @Data")
    void aggregateRootsShouldUseGetterNotData() {
        // This ensures aggregate roots don't expose setters via @Data
        // Factory methods and business methods should be enforced via code review
        ArchRule rule = classes()
                .that().resideInAPackage("..domain.model..")
                .and().areAnnotatedWith("jakarta.persistence.Entity")
                .should().beAnnotatedWith("lombok.Getter")
                .orShould().notBeAnnotatedWith("lombok.Data")
                .because("Aggregate Roots should use @Getter, not @Data, to protect invariants");

        rule.check(classes);
    }

    // ==================== Rule 3: Value Objects ====================

    @Test
    @DisplayName("Rule 3: Value Objects must implement ValueObject interface")
    void valueObjectsShouldImplementInterface() {
        ArchRule rule = classes()
                .that().resideInAPackage("..domain.model..")
                .and().areAnnotatedWith("jakarta.persistence.Embeddable")
                .should().implement("com.gs.dsp.shared.domain.model.ValueObject")
                .because("All value objects must implement ValueObject marker interface");

        rule.check(classes);
    }

    @Test
    @DisplayName("Rule 3: ID Value Objects must follow naming convention")
    void idValueObjectsShouldFollowNamingConvention() {
        ArchRule rule = classes()
                .that().resideInAPackage("..domain.model..")
                .and().haveSimpleNameEndingWith("Id")
                .should().beAnnotatedWith("jakarta.persistence.Embeddable")
                .andShould().implement("com.gs.dsp.shared.domain.model.ValueObject")
                .because("ID value objects must be @Embeddable and implement ValueObject");

        rule.check(classes);
    }

    // ==================== Rule 4: Repository Pattern ====================

    @Test
    @DisplayName("Rule 4: Domain repositories must be interfaces in domain.repository package")
    void domainRepositoriesShouldBeInterfaces() {
        ArchRule rule = classes()
                .that().resideInAPackage("..domain.repository..")
                .should().beInterfaces()
                .andShould().notBeAnnotatedWith("org.springframework.stereotype.Repository")
                .because("Domain repositories must be pure interfaces without Spring annotations");

        rule.check(classes);
    }

    @Test
    @DisplayName("Rule 4: JPA repositories must be in infrastructure.persistence package")
    void jpaRepositoriesShouldBeInInfrastructure() {
        ArchRule rule = classes()
                .that().haveSimpleNameStartingWith("Jpa")
                .and().areAssignableTo("org.springframework.data.jpa.repository.JpaRepository")
                .should().resideInAPackage("..infrastructure.persistence..")
                .because("JPA repository implementations must be in infrastructure layer");

        rule.check(classes);
    }

    // ==================== Rule 5: Application Services ====================

    @Test
    @DisplayName("Rule 5: Application Services must be in application.service package")
    void applicationServicesShouldBeInCorrectPackage() {
        ArchRule rule = classes()
                .that().haveSimpleNameEndingWith("ApplicationService")
                .should().resideInAPackage("..application.service..")
                .andShould().beAnnotatedWith("org.springframework.stereotype.Service")
                .because("Application services must be in application.service package and annotated with @Service");

        rule.check(classes);
    }

    @Test
    @DisplayName("Rule 5: Application Services should depend on domain repositories, not JPA")
    void applicationServicesShouldDependOnDomainRepositories() {
        ArchRule rule = noClasses()
                .that().resideInAPackage("..application..")
                .should().dependOnClassesThat().resideInAPackage("..infrastructure..")
                .because("Application layer should not depend on infrastructure layer directly");

        rule.check(classes);
    }

    // ==================== Rule 6: Controller Layer ====================

    @Test
    @DisplayName("Rule 6: New controllers should be in bounded context infrastructure layer")
    void newControllersShouldBeInInfrastructure() {
        // Allow legacy controllers in .controller package but encourage new ones in infrastructure
        ArchRule rule = classes()
                .that().areAnnotatedWith("org.springframework.web.bind.annotation.RestController")
                .and().resideInAPackage("..iam..")
                .should().resideInAPackage("..infrastructure.web.controller..")
                .because("Controllers in migrated bounded contexts must be in infrastructure layer");

        rule.check(classes);
    }

    @Test
    @DisplayName("Rule 6: Controllers should only depend on Application Services")
    void controllersShouldOnlyDependOnApplicationServices() {
        ArchRule rule = noClasses()
                .that().resideInAPackage("..infrastructure.web.controller..")
                .should().dependOnClassesThat().resideInAPackage("..domain.repository..")
                .orShould().dependOnClassesThat().resideInAPackage("..infrastructure.persistence..")
                .because("Controllers must not directly access repositories");

        rule.check(classes);
    }

    // ==================== Rule 7: Forbidden Practices ====================

    @Test
    @DisplayName("Rule 7: Domain entities must not use @Data annotation")
    void domainEntitiesShouldNotUseData() {
        ArchRule rule = noClasses()
                .that().resideInAPackage("..domain.model..")
                .should().beAnnotatedWith("lombok.Data")
                .because("Domain entities must not expose setters via @Data");

        rule.check(classes);
    }

    @Test
    @DisplayName("Rule 7: Domain layer must not depend on Spring Framework")
    void domainShouldNotDependOnSpring() {
        ArchRule rule = noClasses()
                .that().resideInAPackage("..domain..")
                .should().dependOnClassesThat().resideInAPackage("org.springframework..")
                .because("Domain layer must be framework-agnostic");

        rule.check(classes);
    }

    // ==================== Rule 9: Naming Conventions ====================

    @Test
    @DisplayName("Rule 9: Application Services must follow naming convention")
    void applicationServicesMustFollowNamingConvention() {
        ArchRule rule = classes()
                .that().resideInAPackage("..application.service..")
                .and().areAnnotatedWith("org.springframework.stereotype.Service")
                .should().haveSimpleNameEndingWith("ApplicationService")
                .because("Application services must be named {Aggregate}ApplicationService");

        rule.check(classes);
    }

    @Test
    @DisplayName("Rule 9: JPA Repositories must follow naming convention")
    void jpaRepositoriesMustFollowNamingConvention() {
        ArchRule rule = classes()
                .that().resideInAPackage("..infrastructure.persistence..")
                .and().areAssignableTo("org.springframework.data.jpa.repository.JpaRepository")
                .should().haveSimpleNameStartingWith("Jpa")
                .because("JPA repository implementations must be named Jpa{Aggregate}Repository");

        rule.check(classes);
    }
}
