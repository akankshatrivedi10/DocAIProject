import { MetadataType, MetadataItem, OrgType } from '../types';

interface BestPracticesContext {
    orgType?: OrgType;
    relatedMetadata?: MetadataItem[];
}

/**
 * Generate best practice recommendations for Salesforce metadata
 */
export async function generateBestPractices(
    metadataType: MetadataType,
    metadataItem: MetadataItem,
    context?: BestPracticesContext
): Promise<string> {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const recommendations = getBestPracticesByType(metadataType, metadataItem, context);

    return formatBestPractices(metadataItem.name, metadataType, recommendations);
}

function getBestPracticesByType(
    type: MetadataType,
    item: MetadataItem,
    context?: BestPracticesContext
): string[] {
    const commonPractices = [
        '📝 **Documentation**: Ensure clear inline comments and description fields',
        '🔒 **Security**: Follow principle of least privilege',
        '⚡ **Performance**: Optimize for bulk operations',
    ];

    const typeSpecificPractices: Record<string, string[]> = {
        [MetadataType.APEX_CLASS]: [
            '✅ **Bulkification**: Always design for bulk operations (200+ records)',
            '🧪 **Test Coverage**: Maintain minimum 75% test coverage (aim for 90%+)',
            '🚫 **SOQL Limits**: Avoid SOQL queries inside loops',
            '🔄 **Governor Limits**: Be mindful of heap size and CPU time',
            '📦 **Separation of Concerns**: Use separate classes for business logic, triggers, and utilities',
            '🎯 **Error Handling**: Implement comprehensive try-catch blocks',
        ],
        [MetadataType.TRIGGER]: [
            '🎯 **One Trigger Per Object**: Maintain only one trigger per object per event',
            '🏗️ **Handler Pattern**: Use trigger handler classes for business logic',
            '🔄 **Context Variables**: Properly utilize Trigger.new, Trigger.old, and context booleans',
            '⚡ **Bulkification**: Process all records in collections, not one at a time',
            '🚫 **Recursive Prevention**: Implement static variables to prevent infinite loops',
            '🧪 **Testing**: Create test scenarios for all trigger contexts (before/after insert/update/delete)',
        ],
        [MetadataType.FLOW]: [
            '🎨 **Design**: Keep flows simple and readable - break complex logic into subflows',
            '🔍 **Fault Paths**: Always configure fault connectors for error handling',
            '📊 **Bulkification**: Use Get Records with "All Records" option sparingly',
            '⚠️ **DML Operations**: Minimize DML operations; batch updates when possible',
            '🏷️ **Naming**: Use clear, descriptive labels for all elements',
            '🧪 **Testing**: Test all decision paths and error scenarios',
        ],
        [MetadataType.OBJECT]: [
            '🗂️ **Field Design**: Use appropriate field types and avoid text fields for structured data',
            '🔗 **Relationships**: Design lookup/master-detail relationships carefully',
            '📋 **Validation Rules**: Create user-friendly error messages',
            '🎯 **Required Fields**: Mark essential fields as required at field level, not validation',
            '📈 **Indexed Fields**: Add indexes on frequently queried fields',
            '🏷️ **Naming**: Use clear, business-friendly labels and API names',
        ],
        [MetadataType.VALIDATION_RULE]: [
            '✍️ **Error Messages**: Write clear, actionable error messages for users',
            '🎯 **Specificity**: Target validation to specific scenarios',
            '⚡ **Performance**: Keep formulas simple to avoid performance issues',
            '🧪 **Testing**: Test all edge cases and data combinations',
            '📝 **Documentation**: Document business rules in description field',
        ],
        [MetadataType.PROFILE]: [
            '🔒 **Least Privilege**: Grant minimum necessary permissions',
            '👥 **Permission Sets**: Use permission sets for additional access, not profiles',
            '🔍 **Regular Audits**: Review and update permissions quarterly',
            '📋 **Standardization**: Maintain consistent naming conventions',
            '🚫 **Deprecated**: Consider moving to Permission Sets and Permission Set Groups',
        ],
        [MetadataType.COMPONENT]: [
            '⚡ **LWC Preferred**: Use Lightning Web Components over Aura when possible',
            '🎨 **Reusability**: Design components to be reusable across contexts',
            '📦 **Composition**: Break down complex components into smaller ones',
            '🔄 **Lifecycle**: Properly utilize component lifecycle hooks',
            '🧪 **Jest Tests**: Write comprehensive Jest unit tests',
            '♿ **Accessibility**: Ensure WCAG 2.1 AA compliance',
        ],
    };

    const specificPractices = typeSpecificPractices[type] || [];

    return [...specificPractices, ...commonPractices];
}

function formatBestPractices(
    itemName: string,
    type: MetadataType,
    recommendations: string[]
): string {
    const typeLabel = type.replace(/_/g, ' ').toLowerCase();

    return `# Best Practices: ${itemName}

## Metadata Type: ${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}

### Recommended Practices

${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n\n')}

---

### Additional Resources

- [Salesforce Well-Architected Framework](https://architect.salesforce.com/well-architected/overview)
- [Apex Best Practices](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_bestpractices.htm)
- [Trigger Framework Best Practices](https://developer.salesforce.com/wiki/apex_trigger_best_practices)

### Next Steps

1. Review current implementation against these guidelines
2. Identify areas for improvement
3. Create technical debt tickets for refactoring
4. Update team documentation with these standards

*Generated by DocBot AI - Best Practices Advisor*
`;
}
