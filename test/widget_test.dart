import 'package:flutter_test/flutter_test.dart';
import 'package:doorskill/main.dart';

void main() {
  testWidgets('App splash screen smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const DoorSkillApp());

    // Verify that splash screen title is present
    expect(find.text('DoorSkill'), findsOneWidget);
  });
}
